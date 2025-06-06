// main.cpp
function returnMainCode(data) {
    const { className } = data;
    const cppStr =
        `#include "${className}.h"

void run()
{
	${className} tree;
	tree.initBehaviorTree("config/${className}.xml");
	while (true)
	{
		/// 1- 行为树的tick输出
		BTree::BTIODataVec* outputVec = tree.tick(0.1);
		/// 2- 遍历结果并执行输出
		while (!outputVec->empty())
		{
			auto out = outputVec->front();
			if (out.dataEnum == 1)
			{
				/// TODO
			}
			/// 出队
			outputVec->pop();
		}
		/// 3- 行为树的休眠100ms
		uint64_t deltaT = 100;
		tree.sleepMS(deltaT);
	}
}

int main()
{
	try
	{
		run();
	}
	catch (const std::exception& e)
	{
		std::cout << e.what() << std::endl;
	}
    return 0;
}`
    return cppStr;
}

// 同名.cpp
function returnCppCode(data) {
    // const className = 'PracticeTankTree',//文件名
    //     nodeNameList = ['Aim', 'CheckFireMode', 'Fire', 'Move', 'Reload', 'SetFireMode'];//自定义节点 eg.<Action ID="Aim"
    // const blackboardVars = [ //端口列表 eg.<input_port name="mode" type="uint32_t"/>
    //     { type: 'uint32_t', name: 'mode' },
    //     { type: 'uint32_t', name: 'ammoNum' },
    //     { type: 'SVector3D', name: 'pos' },
    //     { type: 'SVector3D', name: 'dir' },
    //     { type: 'SVector3D', name: 'targetPos' },
    // ];
    const { className, nodeNameList, blackboardVars } = data;

    const header = `#include "${className}.h"
/********* node include file ************/
${nodeNameList.map(node => `#include "${node}.h"`).join('\n')}`;

    // 注册叶子节点
    const registerLines = nodeNameList.map(node => `\tfactory.registerNodeType<${node}>("${node}");`).join('\n');

    const bbLines = blackboardVars.map(
        ({ type, name }) => `\tsetBBValue<${type}>("${name}", &${name});`
    ).join('\n');

    const codeStr =
        `${header}

void ${className}::initBehaviorTree(const char* filePath)
{
    BT::BehaviorTreeFactory factory;
    /// 1- 注册叶子节点
    _registerNodes(factory);
    /// 2- 创建行为树
    _loadTree(factory, filePath);
    /// 3- 初始化参数
    _initParams();
}
void ${className}::_registerNodes(BT::BehaviorTreeFactory& factory)
{
    /// 绑定回调函数
${registerLines}
}
void ${className}::_loadTree(BT::BehaviorTreeFactory& factory, const char* filePath)
{
    m_tree = factory.createTreeFromFile(filePath);
}
BTree::BTIODataVec* ${className}::tick(const double& deltaT)
{
    auto ret = m_tree.tickOnce();
    return m_tree.rootBlackboard()->get<BTree::BTIODataVec*>("output");
}
void ${className}::sleepMS(const uint64_t& ms)
{
    m_tree.sleep(std::chrono::milliseconds(ms));
}
void ${className}::haltTree()
{
    m_tree.haltTree();
}
void ${className}::_initParams()
{
    /// 1- 初始化参数
    /// TODO
    /// 2- 黑板设置映射数据的地方
    /// 2.1- 行为树的输出参数
    setBBValue<BTree::BTIODataVec>("output", &m_outputVec);
    /// 2.2- 黑板设置映射数据的地方
${bbLines}
}`;
    return codeStr;
}

// 同名.h
function returnHeaderCode(data) {
    // const className = 'PracticeTankTree',//文件名
    //     blackboardVars = [ //端口列表 eg.<input_port name="mode" type="uint32_t"/>
    //         { type: 'uint32_t', name: 'mode' },
    //         { type: 'uint32_t', name: 'ammoNum' },
    //         { type: 'SVector3D', name: 'pos' },
    //         { type: 'SVector3D', name: 'dir' },
    //         { type: 'SVector3D', name: 'targetPos' },
    //     ];
    const { className, blackboardVars } = data;
    const memberLines = blackboardVars
        .map(({ type, name }) => `    ${type} ${name};`)
        .join('\n');

    const codeStr = `#pragma once
#include "DataType.h"
#include "behaviortree_cpp/bt_factory.h"

class ${className}
{
public:
    ${className}() {}
    ~${className}() {}

    /// 初始化行为树
    void initBehaviorTree(const char* filePath);
    /// 仿真推进
    BTree::BTIODataVec* tick(const double& deltaT);
    /// 休眠毫秒
    void sleepMS(const uint64_t& ms);
    /// 中断并重置行为树状态
    void haltTree();
    /// 获取行为树内部黑板值的指针引用
    template <typename Anytype>
    Anytype* getBBValue(const std::string& key)
    {
        return m_tree.rootBlackboard()->get<Anytype*>(key);
    }
    /// 设置行为树内部黑板值映射指针
    template <typename Anytype>
    void setBBValue(const std::string& key, Anytype* value)
    {
        m_tree.rootBlackboard()->set<Anytype*>(key, value);
    }

private:
    /// 在行为树工厂注册自定义节点
    void _registerNodes(BT::BehaviorTreeFactory& factory);
    /// 根据xml文件加载行为树
    void _loadTree(BT::BehaviorTreeFactory& factory, const char* filePath);
    /// 初始化参数
    void _initParams();

private:
    /// 行为树
    BT::Tree m_tree;                    /// 行为树
    BTree::BTIODataVec m_outputVec;     /// 行为树的输出参数
    /// 动态数据
${memberLines}
};`;
    return codeStr;
}

// DataType.h
function dataTypeH(data) {
    // const className = 'PracticeTankTree',
    //     dataTypeList = ['SVector3D'];//文件名

    const { className, dataTypeList } = data;

    const structStr = dataTypeList.map(name => `struct ${name}\n{\n};`).join('\n\n');
    const codeStr = `/* @class ${className}
*
* @generate data :
*
*/

#ifndef BT_USER_DATATYPE_H
#define BT_USER_DATATYPE_H

#include <string>
#include <vector>
#include <array>
#include <map>
#include <queue>
#include <any>
#include <unordered_map>

/// 行为树基本库将会用到的基本定义
namespace BTree
{
    /// 行为树参数列表
    typedef std::vector<std::any> BTParamVec;
    /// 行为树参数哈希表
    typedef std::map<std::string, std::any> BTParamMap;
    /// 行为树输入输出数据结构
    struct BTIOData
    {
        uint32_t dataEnum = 0;  /// 数据类型枚举
        BTParamMap paramMap;    /// 数据参数哈希表

        BTIOData()
        {
            clear();
        }
        ~BTIOData()
        {
            clear();
        }
        template<typename T>
        T getParamsValue(const std::string& key)
        {
            return std::any_cast<T>(paramMap.at(key));
        }
        void clear()
        {
            dataEnum = 0;
            paramMap.clear();
        }
    };
    /// 行为树输出数据队列
    typedef std::queue<BTIOData> BTIODataVec;
}

/// USER DATATYPE
${structStr}

#endif`;
    return codeStr;
}

// 节点.cpp
function nodeCppCode(node) {
    // const node =
    // {
    //     ID: "Move",
    //     type: "Action",
    //     nodeType: "StatefulActionNode",
    //     port: {
    //         pos: {
    //             direction: "input_port",
    //             defaultValue: "",
    //             description: "",
    //             value: "{pos}"
    //         },
    //         dir: {
    //             direction: "input_port",
    //             defaultValue: "",
    //             description: "",
    //             value: "{dir}"
    //         },
    //         targetPos: {
    //             direction: "input_port",
    //             defaultValue: "",
    //             description: "",
    //             value: "20,30,0"
    //         }
    //     }

    // };

    // SyncActionNode、ConditionNode 一次性完成 tick()
    // StatefulActionNode 生命周期异步 onStart() onRunning onHalted()


    const { ID, nodeType, port = {} } = node;

    // 获取所有 input_port 并生成代码
    // const inputLines = Object.entries(port)
    //     .filter(([_, p]) => p.direction === "input_port")
    //     .map(([name, p]) => {
    //         return `    auto ${name} = getInput<${guessCppType(p.value)}>("${name}").value();`;
    //     })
    //     .join('\n');

    let cpp = `/* @class ${ID}\n*\n* @generate data :\n* @author :\n*\n*/\n\n`;//头部注释
    cpp += `#include "${ID}.h"\n\n`;

    if (nodeType === "SyncActionNode" || nodeType === "ConditionNode") {
        cpp += `BT::NodeStatus ${ID}::tick()\n{\n`;
        // if (inputLines) cpp += inputLines + "\n\n";
        // cpp += `    // TODO: 实现逻辑\n`;
        cpp += `    return BT::NodeStatus::SUCCESS;\n`;
        cpp += `}\n`;
    } else if (nodeType === "StatefulActionNode") {
        cpp += `BT::NodeStatus ${ID}::onStart()\n{\n`;
        // if (inputLines) cpp += inputLines + "\n\n";
        cpp += `    return BT::NodeStatus::RUNNING;\n`;
        cpp += `}\n\n`;

        cpp += `BT::NodeStatus ${ID}::onRunning()\n{\n`;
        // cpp += `    // TODO: 实现逻辑\n`;
        cpp += `    return BT::NodeStatus::SUCCESS;\n`;
        cpp += `}\n\n`;

        cpp += `void ${ID}::onHalted()\n{\n`;
        cpp += `    m_halted = true;\n`;
        cpp += `}\n`;
    } else {
        cpp += `// Unsupported nodeType: ${nodeType}\n`;
    }

    return cpp;
}
// 节点文件.h
function nodeHeaderCode(node) {
    // const node =
    // {
    //     ID: "Move",
    //     type: "Action",
    //     nodeType: "StatefulActionNode",
    //     port: {
    //         pos: {
    //             direction: "input_port",
    //             defaultValue: "",
    //             description: "",
    //             dataType: "SVector3D",
    //             value: "{pos}"
    //         },
    //         dir: {
    //             direction: "input_port",
    //             defaultValue: "",
    //             description: "",
    //             dataType: "SVector3D",
    //             value: "{dir}"
    //         },
    //         targetPos: {
    //             direction: "input_port",
    //             defaultValue: "",
    //             description: "",
    //             dataType: "SVector3D",
    //             value: "20,30,0"
    //         }
    //     }

    // };

    // SyncActionNode、ConditionNode 一次性完成 tick()
    // StatefulActionNode 生命周期异步 onStart() onRunning onHalted()

    const { ID, nodeType, port = {} } = node;
    const headerGuard = `TREENODE_${ID.toUpperCase()}_H`;

    console.log('port', port)
    // const cppPorts = Object.entries(port)
    //     .map(([name, p]) => {
    //         const portFunc = name === "input_port" ? "InputPort" :
    //             (name === "output_port" ? "OutputPort" : "InoutPort");
    //         return `            BT::${portFunc}<${p.type}*>("${p.name}"),`;
    //     }).join('\n');



    const portTypes = ['input_port', 'output_port', 'inout_port'];
    let cppPorts = '';

    const portFuncMap = {
        input_port: 'InputPort',
        output_port: 'OutputPort',
        inout_port: 'InoutPort'
    };

    for (const type of portTypes) {
        const ports = port[type];
        const portFunc = portFuncMap[type];
        for (const p of ports) {
            cppPorts += `\t\t\tBT::${portFunc}<${p.type}*>("${p.name}"),\n`;
        }
    }

    // 是否需要 m_halted 成员变量(是否是StatefulActionNode)
    const hasHalted = nodeType === "StatefulActionNode";

    let header = `/* @class ${ID}\n*\n* @generate data :\n* @author :\n*\n*/\n\n`;//头部注释
    header += `#ifndef ${headerGuard}\n#define ${headerGuard}\n\n`;
    header += `#include "../DataType.h"\n`;
    header += `#include "behaviortree_cpp/action_node.h"\n\n`;
    header += `class ${ID} : public BT::${nodeType}\n{\n`;
    header += `public:\n`;
    header += `    ${ID}(const std::string& name, const BT::NodeConfig& config) :\n`;
    header += `        BT::${nodeType}(name, config)${hasHalted ? ", m_halted(false)" : ""} {}\n`; //是否需要 m_halted 成员变量
    header += `    static BT::PortsList providedPorts()\n    {\n`;
    header += `        return\n        {\n`;
    header += cppPorts ? cppPorts : '' + `\n        };`;
    header += `\n    }\n\n`;

    // 虚函数接口
    if (hasHalted) {
        header += `    BT::NodeStatus onStart() override;\n`;
        header += `    BT::NodeStatus onRunning() override;\n`;
        header += `    void onHalted() override;\n`;
    } else {
        header += `    BT::NodeStatus tick() override;\n`;
    }

    if (hasHalted) {
        header += `private:\n    bool m_halted;\n`;
    }
    // 
    header += `};\n\n#endif`;

    return header;
}
export default {
    returnMainCode,
    returnCppCode,
    returnHeaderCode,
    dataTypeH,
    nodeCppCode,
    nodeHeaderCode
}