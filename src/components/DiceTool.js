// src/components/DiceTool.js
import React, { useState, useEffect } from 'react';
import './DiceTool.css';

const DiceTool = () => {
    const [result, setResult] = useState('');
    const [command, setCommand] = useState('');
    const [ws, setWs] = useState(null);
    const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
    const [loading, setLoading] = useState(false); // 添加加载状态

    useEffect(() => {
        const socket = new WebSocket(`ws://127.0.0.1:8000/dice/ws`);
        setWs(socket);

        socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            let output = '';

            if (message.command.toLowerCase() === 'r') {
                output += `<h3>掷骰指令：${message.result[0]}</h3>`;
                output += `<p>点数：${message.result[1]}</p>`;
                output += `<p>每次骰点结果：${message.result[2].join(', ')}<p>`;
            } else if (message.command.toLowerCase() === 'rm') {
                output += `<h3>掷骰指令: ${message.result[0]}</h3>`;
                output += `<p>点数: ${message.result[1]}</p>`;
                output += `<p>每次骰点结果: ${message.result[2].join(', ')}<p>`;
            } else if (message.command.toLowerCase() === 'rd') {
                output += `<h3>属性掷骰：${message.result[0]} - ${message.result[1]}</h3>`;
                output += `<p>点数：${message.result[2]}，${message.result[3]}<p>`;
            } else if (message.command.toLowerCase() === 'rh') {
                output += `<h3>暗骰点数：${message.result}</h3>`;
            } else if (message.command.toLowerCase() === 'rav' || message.command.toLowerCase() === 'ravs') {
                if (message.result.length === 11) {
                    output += `<h3>对抗骰点：PC${message.result[0]} vs. PC${message.result[1]}</h3>`;
                    output += `<p>PC${message.result[0]} - ${message.result[2]} - 属性${message.result[4]}/出目${message.result[6]} - ${message.result[8]}</p>`;
                    output += `<p>PC${message.result[1]} - ${message.result[3]} - 属性${message.result[5]}/出目${message.result[7]} - ${message.result[9]}</p>`;
                    output += `<p><strong>PC${message.result[10]}胜利</strong></p>`
                } else if  (message.result.length === 9) {
                    output += `<h3>对抗骰点：NPC vs. PC${message.result[0]}</h3>`;
                    output += `<p>NPC - 属性${message.result[2]}/出目${message.result[4]} - ${message.result[6]}</p>`;
                    output += `<p>PC${message.result[0]} - ${message.result[1]} - 属性${message.result[3]}/出目${message.result[5]} - ${message.result[7]}</p>`;
                    output += `<p><strong>${message.result[8] === 1 ? "PC" : "NPC"}胜利</strong></p>`
                } else if (message.result.length === 7) {
                    output += `<h3>对抗骰点：NPC1 vs. NPC2</h3>`;
                    output += `<p>NPC1 - 属性${message.result[0]}/出目${message.result[2]} - ${message.result[4]}</p>`;
                    output += `<p>NPC2 - 属性${message.result[1]}/出目${message.result[3]} - ${message.result[5]}</p>`;
                    output += `<p><strong>${message.result[6]}胜利</strong></p>`
                }
            } else if (message.command.toLowerCase() === 'sc') {
                if (message.result.length === 7) {
                    output += `<h3>San Check ${message.result[0]}/${message.result[1]}</h3>`;
                    output += `<p>灵感 - 属性${message.result[2]}/出目${message.result[4]} - ${message.result[3]}</p>`;
                    output += `<p>San值减少${message.result[5]}点，剩余San:${message.result[6]}`;
                } else if (message.result.length === 2) {
                    output += `<h3>San值恢复</h3>`;
                    output += `<p>恢复量 - ${message.result[0]}</p>`;
                    output += `<p>当前San - ${message.result[1]}</p>`;
                }
            } else if (message.command.toLowerCase() === 'st') {
                output += `<h3>属性查询</h3>`;
                output += `<p>属性：${message.result[0]}</p>`;
                output += `<p>属性值：${message.result[1]}</p>`;
            } else if (message.command.toLowerCase() === 'hp') {
                output += `<h3>HP调整</h3>`
                output += `<p>调整值：${message.result[0]}</p>`;
                if (message.result[0] !== message.result[1]) {
                    output += `<p>出目：${message.result[1]}</p>`;
                }
                output += `<p>当前HP：${message.result[2]}</p>`;
            }

            output += `<p>IP 地址：${message.ip}</p>`;
            output += `<p>当前时间：${message.time}</p>`;
            
            setLoading(false); // 数据返回后取消加载状态
            setResult(output);
        };

        socket.onclose = (event) => {
            console.error('WebSocket closed:', event);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            socket.close();
            console.log('WebSocket connection closed');
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true); // 提交请求时设置加载状态
        const [cmd, ...args] = command.split(' ');
    
        const dicePattern = /^(\d*)d(\d+)(([+-]\d*d\d+|\d+)*)$/i;
    
        let payload;
        
        if (command.match(dicePattern)) {
            payload = {
                command: 'r',
                a1: command, // Use the entire command as a1
                ip: await getIpAddress(),
                time: new Date().toLocaleTimeString()
            };
        } else if (cmd.match(/^(r|rm|rd|rh|rav|ravs|sc|st|hp)$/i)) {
            payload = {
                command: cmd,
                a1: args[0] || "",
                a2: args[1] || "",
                a3: args[2] || "",
                a4: args[3] || "",
                a5: args[4] || "",
                a6: args[5] || "",
                ip: await getIpAddress(),
                time: new Date().toLocaleTimeString()
            };
        } else {
            setResult('<p>输入指令无效，请点击“操作指引”获取帮助。</p>');
            setLoading(false); // 发生错误后取消加载状态
            return;
        }
    
        try {
            const response = await fetch('http://127.0.0.1:8000/dice/roll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail);
            }
    
            const data = await response.json();
            ws.send(JSON.stringify(data));
        } catch (error) {
            console.error('Error:', error);
            setResult(`发生错误：${error.message}。请点击“操作指引”获取帮助。`);
            setLoading(false); // 发生错误后取消加载状态
        }
    };

    const getIpAddress = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error fetching IP address:', error);
            return '未知';
        }
    };

    const showInstructions = () => {
        const instructions = [
            {
                title: '欢迎使用普通骰子',
                content: ['开发中，有任何问题可以联系zhiyuan.gan@outlook.com']
            },
            {
                title: '指令使用方法',
                content: [
                    '- 所有指令的使用方法均为【指令 参数1 参数2 ...】', 
                    '- 例如进行一次普通掷骰：r 1d3，此时r为指令，1d3为参数，参数之间通过空格分隔'
                ]
            },
            {
                title: '普通掷骰 - r',
                content: [
                    '例：r 1d3 - 进行1次d3骰', 
                    '例：r d8+10 - 进行一次d8骰后加10'
                ]
            },
            {
                title: '带奖励骰的掷骰 - rm',
                content: [
                    '参数1中的数字为奖励骰的数量减去惩罚骰的数量，此命令会自动执行d100', 
                    '例：rm 2 - 进行掷骰，2个奖励骰', 
                    '例：rm -1 - 进行掷骰，1个惩罚骰'
                ]
            },
            {
                title: '属性掷骰 - ra',
                content: [
                    'PC编号为上传PC属性时所选择的编号', 
                    '例：ra 1 厨艺 - PC1厨艺掷骰', 
                    '例：ra 3 力量 - PC3力量掷骰',
                    '例：ra 2 聆听 1 - PC2聆听掷骰，1个奖励骰',
                    '例：ra 1 力量 -1 - PC1力量掷骰，1个惩罚骰'
                ]
            },
            {
                title: '暗骰 - rh',
                content: ['rh 1d8 - 进行一次1d8暗骰，但结果只有我本人看得懂，如果你是kp，请联系我']
            },
            {
                title: '对抗骰 - rav/ravs',
                content: [
                    'rav命令为普通模式对抗，成功等级高者胜，成功等级相同则技能等级高者胜',
                    'ravs命令为严格对抗模式，前者的成功等级必须高于后者才算胜利，否则失败',
                    '例：rav 1 厨艺 2 厨艺 - PC1与PC2进行厨艺对抗，普通对抗模式', 
                    '例：ravs 1 厨艺 4 厨艺 1 0 - PC1与PC4进行厨艺对抗，严格对抗模式，PC1有1个奖励骰', 
                    '例：rav 80 1 厨艺 - NPC与PC1进行对抗，NPC的技能为80，NPC置于前位，当严格对抗开启时，NPC成功等级必须高于PC才能获胜', 
                    '例：ravs 2 力量 50  - PC2与NPC进行对抗，NPC的技能为50，PC置于前位，当严格对抗开启时，PC成功等级必须高于NPC才能获胜', 
                    '例：rav 80 80  - 两个NPC进行对抗，数值均为80', 
                    '例：rav 58 80 1 -1  - 两个NPC进行对抗，前者数值为50，后者数值为80，前者有1个奖励骰，后者有1个惩罚骰', 
                ]
            },
            {
                title: 'SAN CHECK或SAN值调整 - sc',
                content: [
                    '当参数为2个时，为SAN值调整，第1个参数为玩家ID，第2个参数为调整值',
                    '当参数为3个时，为SAN CHECK，第1个参数为玩家ID，第2个参数为成功时扣减值，第3个参数为失败时扣减值',
                    '例：sc 1 5 - PC1的当前SAN值增加5',
                    '例：sc 2 1 1d3 - PC2进行SAN CHECK，成功减1，失败减1d3',
                    '例：sc 5 1d10 1d100 - PC5进行SAN CHECK，成功减1d10，失败减1d100',
                ]
            },
            {
                title: 'HP调整 - hp',
                content: [
                    '第1个参数为玩家ID，第2个参数为调整值',
                    '例：hp 1 5 - PC1的当前HP增加5',
                    '例：hp 2 -1d10 - PC2的当前HP减少1d10',
                ]
            },
            {
                title: '查看属性 - st',
                content: [
                    '第1个参数为玩家ID，第2个参数为查看的属性值',
                    '例：st 1 int - 查看PC1的INT',
                ]
            },
        ];
    
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ''; // Clear previous content
    
        instructions.forEach(instruction => {
            const section = document.createElement('div');
            section.className = 'instruction-section';
    
            const title = document.createElement('h3');
            title.className = 'instruction-title';
            title.textContent = instruction.title;
    
            section.appendChild(title);
    
            instruction.content.forEach(line => {
                const content = document.createElement('p');
                content.className = 'instruction-content';
                content.textContent = line;
                section.appendChild(content);
            });
    
            resultDiv.appendChild(section);
        });
    };

    const showModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleStatsUpload = async () => {
        const userId = document.getElementById('userId').value;
        const statsContent = document.getElementById('statsContent').value;
        const createNew = document.getElementById('createNew').checked;

        if (!userId || !statsContent) {
            alert('请填写ID和属性');
            return;
        }

        const data = {
            user_id: parseInt(userId, 10),
            stats: statsContent,
            create_new: createNew
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/dice/upload_stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert('角色属性上传成功');
                closeModal();
            } else {
                alert(`Error: ${result.detail}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('角色属性上传失败，请重试');
        }
    };

    return (
        <div className="container">
            <h1>骰点工具</h1>
            <form id="diceForm" onSubmit={handleSubmit}>
                <label htmlFor="command">指令：</label>
                <input
                    type="text"
                    id="command"
                    name="command"
                    required
                    autoComplete="off"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                />
                <div className="button-container">
                    <button type="submit" className="btn roll-btn" disabled={loading}>
                        {loading ? '加载中...' : '骰！'}
                    </button>
                    <button type="button" onClick={showInstructions} className="btn instruction-btn">操作指引</button>
                    <button type="button" onClick={showModal} className="btn upload-btn">上传角色</button>
                </div>
            </form>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )} {/* 添加加载动画 */}
            <h2>骰点结果</h2>
            <div id="result" dangerouslySetInnerHTML={{ __html: result }}></div> {/* Use dangerouslySetInnerHTML to render HTML */}

            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>上传角色数据</h2>
                        <div className="form-group inline-group">
                            <label htmlFor="userId">角色ID(0-999):</label>
                            <input type="number" id="userId" name="userId" min="0" max="999" required />
                        </div>
                        <div className="form-group inline-group">
                            <label htmlFor="createNew">创建新文件</label>
                            <input type="checkbox" id="createNew" name="createNew" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="statsContent">属性文本</label>
                            <textarea id="statsContent" name="statsContent" rows="4" required></textarea>
                        </div>
                        <p className="warning">超过一个月未修改的角色数据将被删除</p>
                        <div className="modal-button-container">
                            <button type="button" onClick={handleStatsUpload} className="btn modal-btn">提交</button>
                            <button type="button" onClick={closeModal} className="btn modal-btn">取消</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiceTool;
