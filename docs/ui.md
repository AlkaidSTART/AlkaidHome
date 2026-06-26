"Cosmic Agentic Canvas" 作品集平台 UI/UX 设计方案 (太空轨道版)
一、 视觉风格与宇宙质感 (Cosmic Aesthetics)
为了模拟深邃、神秘且高精度的太空质感，整体设计将由“绝对的黑”和“高精度的几何线条”构成。

1. 色彩与质感 (Color & Texture)
   宇宙深空背景 (Deep Space): 纯黑 #000000 到 微亮碳黑 #050507 的极细腻渐变。

星尘微光 (Star Dust): 背景使用 CSS Canvas 渲染出无数微小的、明暗闪烁的白点（opacity: 0.1 ~ 0.5），模拟遥远的星系。

轨道线 (Orbit Lines): #1e1b4b（极暗的夜空蓝紫）或 #27272a（暗锌灰）。非常细的 0.5px 实线，带有淡淡的隐没效果。

核心与能量 (The Sun / Core): 核心（代表你或核心调度器）采用冷白荧光或深邃暗紫，带有强烈的 filter: drop-shadow 呼吸灯发光特效。

2. 空间感 (3D Perspective)
   整个视口（Viewport）开启 CSS perspective: 1200px。

所有的轨道并不是平面的，而是整体向下倾斜约 60 度（X轴旋转），形成一个俯瞰的、具有强烈纵深感（Z轴）的 3D 星球公转盘面。

二、 核心场景交互设计 (The Dynamic System)
页面主体由一个巨大的 3D 粒子星系盘面 构成。

1. 中心天体：The Core (Orchestrator)
   视觉: 屏幕正中央是一个黑洞或微光恒星形态的几何球体。内部隐约可见旋转的网格。

心智: 代表你的核心工程架构能力（或者 Multi-Agent 中的调度中心）。

2. 四大环绕行星：The Project Agents
   4 个核心项目化身为 4 颗悬浮的“数字行星”，各有一条相互独立、远近交错的轨道。

Plaintext
/ /
+------------+ +------------+
/ Project 01 / / Project 02 /
+------------+ +------------+
\ /
\ +-------+ /
\ | YOUR | /
--------------------| CORE |-------------------- (3D Orbit Plane)
/ +-------+ \
 / \
 / \
 +------------+ +------------+
/ Project 03 / / Project 04 /
+------------+ +------------+
/ /
🪐 行星 01：VoiceCanvas (多模态实时交互)
外观: 表面包裹着一层不断波动的环形动态声波（SVG Stream），随着公转产生频率变化。

🪐 行星 02：Autonomous Task Agent (Tool Use 智能体)
外观: 核心呈现出机械构造感。它在公转时，身后会拖着几条细小的“卫星线”，分别连接着 Search、Code、Email 等小图标，代表它自主调用的工具链。

🪐 行星 03：Multi-Agent System (多智能体协作)
外观: 它不是一颗星球，而是一个由 3 个微型粒子气泡（Research, Writer, Critic）紧密环绕移动的“联星系统”。

🪐 行星 04：Agentic RAG & Memory Hub (长期记忆知识库)
外观: 一个散发着冷光、内部如同神经元网络般不断闪烁的点阵晶体，代表海量数据的检索与语义记忆。

三、 GSAP 动效落地脚本策略 (电影级交互)
利用 GSAP 的 MotionPathPlugin 和 3D 属性，可以在静态网页上完美实现这种太空轨迹。

1. 基础公转动画 (Infinite Orbit)
   4个项目卡片在各自的 SVG 椭圆轨道上做永无止境的慢速公转。

3D 层级处理（关键点）： 传统 2D 无法区分前后。我们可以利用 GSAP 的 onUpdate 检查项目当前的 Y 坐标或公转角度。当它转到中心点“上方”时，降低其 scale 和 z-index，并调暗亮度（模拟转到背面）；转到“下方”时，放大、变亮（转到正面）。

JavaScript
// 核心逻辑伪代码
gsap.to(".project-planet-1", {
motionPath: {
path: "#orbit-svg-path-1",
autoRotate: false
},
duration: 20,
repeat: -1,
ease: "none",
onUpdate: function() {
// 根据当前在轨道上的百分比，动态计算 scale, zIndex, opacity
let progress = this.progress();
let opacity = Math.sin(progress _ Math.PI _ 2) > 0 ? 1 : 0.3; // 模拟前后遮挡
gsap.set(".project-planet-1", { opacity: opacity, filter: `blur(${opacity < 0.5 ? '2px' : '0px'})` });
}
}); 2. 鼠标悬停拦截 (Hover to Inspect)
交互体验: 当 HR 的鼠标悬停在某一颗“项目行星”上时，整个星系的公转速度瞬间变慢（或优雅暂停），卡片微微放大，并弹出一个高保真的冷白色半透明科幻悬浮窗（HUD Panel）。

展现内容: 悬浮窗内以极简的等宽字体（JetBrains Mono）闪烁显示该项目的指标：[LATENCY: 1.2s]、[TOKEN_SAVED: 65%] 等工程硬核数据。

3. 滚轮穿梭效果 (Scroll to Zoom/Enter)
   滚动交互: 当用户向下滚动页面时，GSAP ScrollTrigger 绑定星系的 3D 缩放。

效果: 整个太空星系开始“向玩家脸上扑过来”（scale: 1 -> 4, translateZ: 0 -> 800px），实现一种在科幻电影里“跃迁穿梭进入某颗星球内部”的转场效果，直接无缝平滑切入该项目的“技术细节复盘”大图。

四、 ASCII 视觉结构概念图
这是该页面在不滚动时的静止状态视觉快照，你可以直观地看到这种几何感与太空感的排版：

Plaintext
+-----------------------------------------------------------------------------------------+
| [🌌 Cosmic Agentic Canvas] [Connect] |
|-----------------------------------------------------------------------------------------|
| |
| . _ . . _ . |
| . .-'````'-. . . |
| . + .-' '-. + |
| [🪐 VoiceCanvas] .-' .----------. '-. [🪐 Multi-Agent] |
| (Active) / / \ \ (Orchestrator) |
| | | CORE ● | | |
| . | \ (Ecosystem) / | . |
| \- \ / / |
| [🪐 Agentic RAG] '-. '----------' .-' [🪐 Autonomous Agent] |
| (Memory Base) '-. .-' (Tool Use) |
| '-.\__\_\_.-' |
| \* \* . |
| |
|-----------------------------------------------------------------------------------------|
| >_ System Status: Orbiting Normal // Speed: 0.02ly/s [Click Planet to Log] |
+-----------------------------------------------------------------------------------------+
做出
