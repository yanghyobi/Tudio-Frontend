import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { BsMic, BsMicMute, BsCameraVideo, BsCameraVideoOff, BsChatDots, BsTelephoneX, BsSend, BsCopy } from "react-icons/bs";
import swal from 'sweetalert2';
import './videoChat.css';
import { IoChevronBack, IoClose } from "react-icons/io5";

const DEVELOPMENT_IP = '';
const AWS_PUBLIC_IP = '';
const SIGNALING_SERVER_URL = `https://${AWS_PUBLIC_IP}:3000`;
const TURN_USERNAME = '';
const TURN_PASSWORD = '';

// STUN/TURN 서버 설정
const rtcConfig = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: `turn:${AWS_PUBLIC_IP}:3478`,
          username: TURN_USERNAME,
          credential: TURN_PASSWORD
        },
        {
          urls: `turn:${AWS_PUBLIC_IP}:3478?transport=tcp`,
          username: TURN_USERNAME,
          credential: TURN_PASSWORD
        }
    ],
    iceCandidatePoolSize: 10
};

const parseJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

const VideoMeetingRoom = () => {
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const jwtToken = searchParams.get("token");
    const decodedToken = jwtToken ? parseJwt(jwtToken) : null;
    const [roomName, setRoomName] = useState("연결 중...");
    const myName = decodedToken?.memName || "Guest";
    const waitingRoomUrl = `http://localhost:8060/tudio/videoChat/waitingRoom/${roomId}`; 
    const roomPw = decodedToken?.roomPw || searchParams.get("roomPw") || location.state?.roomPw || "비밀번호 없음";

    const [peers, setPeers] = useState([]);
    const [msgs, setMsgs] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const socketRef = useRef();
    const myStreamRef = useRef();
    const myVideoRef = useRef();
    const pcsRef = useRef({}); 
    const chatEndRef = useRef();

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [msgs, isChatOpen]);

    useEffect(() => {
        if (socketRef.current) return;

        const init = async () => {
            if (!jwtToken || !decodedToken) {
                await swal.fire("접근 오류", "입장권이 없습니다.", "error");
                window.location.href = "http://localhost:8060/tudio/videoChat/list";
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 1280, height: 720 }, 
                    audio: true 
                });
                myStreamRef.current = stream;
                if (myVideoRef.current) myVideoRef.current.srcObject = stream;

                console.log("📹 로컬 미디어 준비 완료 -> 시그널링 연결");
                connectSocket();
            } catch (err) {
                console.error("❌ 미디어 획득 실패:", err);
                swal.fire("권한 필요", "카메라/마이크 권한을 허용해주세요.", "warning");
            }
        };

        init();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            Object.values(pcsRef.current).forEach(pc => pc.close());
            pcsRef.current = {};
            setPeers([]);
        };
    }, []);

    const connectSocket = () => {
        socketRef.current = io.connect(SIGNALING_SERVER_URL, {
            auth: { token: jwtToken },
            rejectUnauthorized: false
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
            console.log("시그널링 서버 연결됨:", socket.id);
            socket.emit("join_room", {
                roomId: roomId, 
                userType: "MEETING" 
            });
            fetchRoomNameAndSync(socket);
        });

        socket.on("trigger_close_room", () => {
            swal.fire({
                title: "회의 종료",
                text: "회의가 종료되어 창을 닫습니다.",
                icon: "info",
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.close(); 
            });
        });

        socket.on("room_info", (data) => {
            console.log("📡 서버로부터 받은 화상미팅 정보:", data);
            if (data.roomName) {
                setRoomName(data.roomName);
            }
        });

        socket.on("all_users", (users) => {
            users.forEach(user => {
                if (user.socketId !== socket.id) {
                    createPeerConnection(user.socketId, user.name, false);
                }
            });
        });

        socket.on("user_joined", (user) => {
            if (user.socketId !== socket.id) {
                console.log(`🚪 새 유저 입장: ${user.name}`);
                createPeerConnection(user.socketId, user.name, true);
            }
        });

        socket.on("offer", async ({ from, offer }) => {
            const pc = pcsRef.current[from];
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("answer", { targetId: from, answer });
            } catch (err) { console.error("Offer 처리 실패", err); }
        });

        socket.on("answer", async ({ from, answer }) => {
            const pc = pcsRef.current[from];
            if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice", async ({ from, candidate }) => {
            const pc = pcsRef.current[from];
            if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        });

        socket.on("chat_message", (msg) => {
            setMsgs(prev => [...prev, msg]);

            if (msg.sender !== myName && !isChatOpen) {
                setUnreadCount(prev => prev + 1);
            }
        });

        socket.on("media_state_change", ({ socketId, type, enabled }) => {
            console.log(`📡 [${socketId}] ${type} 상태 변경:`, enabled);
            setPeers(prevPeers => prevPeers.map(p => {
                if (p.socketId === socketId) {
                    return { 
                        ...p, 
                        [type === "cam" ? "camOn" : "micOn"]: enabled 
                    };
                }
                return p;
            }));
        });

        socket.on("user_left", ({ socketId }) => {
            if (pcsRef.current[socketId]) {
                pcsRef.current[socketId].close();
                delete pcsRef.current[socketId];
            }
            setPeers(prev => prev.filter(p => p.socketId !== socketId));
        });
    };

    const createPeerConnection = (socketId, userName, shouldCreateOffer) => {
        if (pcsRef.current[socketId]) return;

        const pc = new RTCPeerConnection(rtcConfig);
        pcsRef.current[socketId] = pc;

        if (myStreamRef.current) {
            myStreamRef.current.getTracks().forEach(track => pc.addTrack(track, myStreamRef.current));
        }

        pc.onicecandidate = (e) => {
            if (e.candidate) socketRef.current.emit("ice", { targetId: socketId, candidate: e.candidate });
        };

        pc.ontrack = (e) => {
            console.log(`🎬 [${userName}] 트랙 수신 완료`);
            if (socketId === socketRef.current.id) return;

            setPeers(prev => {
                const filtered = prev.filter(p => p.socketId !== socketId);
                return [...filtered, { 
                    socketId, 
                    name: userName, 
                    stream: e.streams[0], 
                    camOn: true, 
                    micOn: true 
                }];
            });
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                pc.close();
                delete pcsRef.current[socketId];
                setPeers(prev => prev.filter(p => p.socketId !== socketId));
            }
        };

        if (shouldCreateOffer) {
            pc.onnegotiationneeded = async () => {
                try {
                    if (pc.signalingState !== "stable") return;
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socketRef.current.emit("offer", { targetId: socketId, offer });
                } catch (err) { console.error("Offer 생성 실패", err); }
            };
        }
    };

    const fetchRoomNameAndSync = async (socket) => {
        try {
            console.log("📡 STS에 방 정보 요청 중... (Token 포함)");
            
            const response = await fetch(`http://localhost:8060/tudio/videoChat/getRoomInfo/${roomId}`, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`, 
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`서버 응답 에러: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.roomName) {
                setRoomName(data.roomName);
                
                socket.emit("set_room_name", { 
                    roomId: roomId, 
                    roomName: data.roomName 
                });
                console.log("✅ 방 이름 동기화 완료:", data.roomName);
            }
        } catch (err) {
            console.error("❌ STS 통신 실패:", err);
            setRoomName("방 정보를 불러올 수 없음");
        }
    };

    const handleEndCall = () => {
        swal.fire({
            title: '회의를 종료하시겠습니까?',
            text: "창이 닫히며 회의실에서 나갑니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: '나가기',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
                window.close(); 
                
                setTimeout(() => {
                    window.location.href = "about:blank";
                }, 500);
            }
        });
    };

    const copyUrl = () => {
        navigator.clipboard.writeText(waitingRoomUrl);
        swal.fire({ toast:true, position:'top', icon:'success', title:'URL이 복사되었습니다.', showConfirmButton:false, timer:1500 });
    };

    const sendChat = () => {
        if (!inputMsg.trim()) return;
        const chatData = { 
            roomId, 
            message: inputMsg,
            sender: myName, 
            timestamp: new Date().toISOString() 
        };
        socketRef.current.emit("chat_message", chatData);
        setInputMsg("");
    };

    const toggleMic = () => {
        if (myStreamRef.current) {
            const audioTrack = myStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMicOn(audioTrack.enabled);
                socketRef.current.emit("media_state_change", { 
                    roomId, 
                    type: "mic", 
                    enabled: audioTrack.enabled 
                });
            }
        }
    };

    const toggleCam = () => {
        if (myStreamRef.current) {
            const videoTrack = myStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setCamOn(videoTrack.enabled);
                socketRef.current.emit("media_state_change", { 
                    roomId, 
                    type: "cam", 
                    enabled: videoTrack.enabled 
                });
            }
        }
    };

    const toggleChat = () => {
        const nextState = !isChatOpen;
        setIsChatOpen(nextState);
        
        if (nextState) {
            setUnreadCount(0);
        }
    };

    return (
        <div style={styles.container}>
            <div style={{...styles.videoArea, width: isChatOpen ? 'calc(100% - 320px)' : '100%'}}>
                <div style={styles.roomInfo}>
                    <div style={styles.infoLine}><b>🏠 </b> {roomName}</div>
                    <div style={styles.infoLine}><b>ID:</b> {roomId}</div>
                    <div style={styles.infoLine}><b>PW:</b> {roomPw}</div>
                    <div style={{...styles.infoLine, display:'flex', alignItems:'center', gap:8}}>
                        <span style={{fontSize:'0.8em', opacity:0.7, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{waitingRoomUrl}</span>
                        <button onClick={copyUrl} style={styles.copyBtn} title="복사"><BsCopy size={14}/></button>
                    </div>
                </div>
                <div style={styles.grid}>
                    <div style={styles.videoCard}>
                        <video ref={myVideoRef} autoPlay playsInline style={{...styles.video, transform: 'scaleX(-1)'}} />
                        {!camOn && (<div style={styles.videoOffOverlay}><BsCameraVideoOff size={50} color="#555"/></div>)}
                        <span style={styles.nameTag}>{myName} (나)</span>
                        {!micOn && <span style={styles.muteIcon}>🔇</span>}
                    </div>

                    {peers
                        .filter(p => p.name !== myName)
                        .map(p => (
                        <div key={p.socketId} style={styles.videoCard}>
                            <RemoteVideo stream={p.stream} name={p.name} />
                            {p.camOn === (false && <div style={styles.videoOffOverlay}><BsCameraVideoOff size={50} color="#555"/></div>)}
                            <span style={styles.nameTag}>{p.name}</span>
                            {p.micOn === false && <span style={styles.muteIcon}>🔇</span>}
                        </div>
                    ))}
                </div>

                <div style={styles.controls}>
                    <button onClick={toggleMic} style={{...styles.btn, background: micOn ? '#3c4043' : '#ea4335'}}>
                        {micOn ? <BsMic/> : <BsMicMute/>}
                    </button>
                    <button onClick={toggleCam} style={{...styles.btn, background: camOn ? '#3c4043' : '#ea4335'}}>
                        {camOn ? <BsCameraVideo/> : <BsCameraVideoOff/>}
                    </button>
                    <button onClick={toggleChat} style={{...styles.btn, background: isChatOpen ? '#8ab4f8' : '#3c4043', position: 'relative', color: isChatOpen ? '#000' : '#fff'}}>
                        <BsChatDots />
                        {!isChatOpen && unreadCount > 0 && (
                            <span style={styles.badge}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <button onClick={handleEndCall} style={{...styles.btn, ...styles.exitBtn}}>
                        <BsTelephoneX/>
                    </button>
                </div>
            </div>

            {isChatOpen && (
                <aside className="chat-sidebar chat-widget">
                    <header className="chat-room-header">
                        <div className="header-left">
                            <button className="header-btn" onClick={() => setIsChatOpen(false)} aria-label="닫기">
                                <IoChevronBack size={24} />
                            </button>
                        </div>

                        <h2 className="room-title">
                            <span className="room-name-text">{roomName}</span>
                            <span className="member-count">{peers.length + 1}</span>
                        </h2>

                        <div className="header-right-placeholder"></div>
                    </header>

                    <main className="chat-room-content">
                        {msgs.map((m, i) => {
                            const isMine = m.sender === myName;
                            return (
                                <div key={i} className={`message-row ${isMine ? 'sent' : 'received'}`}>
                                    <div className="message-content">
                                        {!isMine && <span className="sender-name">{m.sender}</span>}
                                        
                                        <div className="bubble-container" style={{ display: 'flex', alignItems: 'flex-end', gap: '5px' }}>
                                            {isMine && (
                                                <span className="message-time">
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                            
                                            <div className="message-bubble">{m.message}</div>
                                            
                                            {!isMine && (
                                                <span className="message-time">
                                                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </main>
                    <footer className="chat-input-area">
                        <div className="input-wrapper">
                            <input 
                                className="chat-input"
                                value={inputMsg}
                                onChange={(e) => setInputMsg(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                                placeholder="메시지 보내기"
                            />
                        </div>
                        <button className="footer-btn send-btn" onClick={sendChat} 
                                style={{background: '#007aff', color:'#fff', border:'1px', borderRadius:'50%', width:'35px', height:'35px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <BsSend size={16}/>
                        </button>
                    </footer>
                </aside>
            )}
        </div>
    );
};

const RemoteVideo = ({ stream, name }) => {
    const ref = useRef();
    
    useEffect(() => { 
        if (!ref.current || !stream) return;

        const video = ref.current;
        video.srcObject = stream;
        
        const handlePlay = async () => {
            try {
                await video.play();
                console.log(`✅ [${name}] 비디오 재생 시작`);
            } catch (err) {
                console.error(`❌ [${name}] 자동재생 차단(클릭 필요):`, err);
            }
        };
        video.onloadedmetadata = handlePlay;
    }, [stream, name]);

    return <video ref={ref} autoPlay playsInline muted style={styles.video} />;
};

const styles = {
    container: { display: 'flex', width: '100vw', height: '100vh', background: '#202124', color: 'white', overflow: 'hidden', fontFamily: 'Pretendard' },
    videoArea: { position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.3s' },
    roomInfo: { position: 'absolute', top: 20, left: 20, background: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '12px', zIndex: 100, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px' },
    infoLine: { marginBottom: '5px' },
    copyBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer', display: 'flex' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px', width: '92%', height: '82%' },
    videoCard: { position: 'relative', background: '#3c4043', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
    video: { width: '100%', height: '100%', objectFit: 'cover' },
    nameTag: { position: 'absolute', bottom: 15, left: 15, background: 'rgba(0,0,0,0.7)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', zIndex: 50 },
    muteIcon: { position: 'absolute', top: 15, right: 15, background: 'rgba(234,67,53,0.8)', padding: '8px', borderRadius: '50%', zIndex: 51 },
    videoOffOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    controls: { position: 'absolute', bottom: 30, display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.8)', padding: '12px 30px', borderRadius: '50px', zIndex: 200 },
    btn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: '0.2s' },
    exitBtn: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', background: '#ea4335', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    chatSidebar: { width: '320px', background: '#f7f7f7', color: 'black', display: 'flex', flexDirection: 'column', boxShadow: '-2px 0 10px rgba(0,0,0,0.1)' },
    chatHeader: { padding: '15px 20px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    chatBody: { flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f2f2f7' },
    chatRow: { display: 'flex', width: '100%' },
    chatBubble: { maxWidth: '75%', padding: '8px 12px', position: 'relative', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', fontSize: '14px' },
    chatSender: { fontSize: '11px', fontWeight: 'bold', marginBottom: '3px', color: '#333' },
    chatTime: { fontSize: '10px', color: '#666', textAlign: 'right', marginTop: '4px' },
    chatInputBox: { padding: '15px', background: '#fff', display: 'flex', gap: '8px' },
    input: { flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' },
    sendBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#fee500', color: '#3c1e1e', cursor: 'pointer', display:'flex', justifyContent:'center', alignItems:'center' },
    badge: { position: 'absolute', top: '-2px', right: '-2px', background: '#ea4335', color: 'white', fontSize: '10px', fontWeight: 'bold', minWidth: '18px', height: '18px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 4px', border: '2px solid #202124', zIndex: 10 },
};

export default VideoMeetingRoom;