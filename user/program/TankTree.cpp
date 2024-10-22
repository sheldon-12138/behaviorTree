
void TankTree::InitBehaviorTree(const char* filePath)
{
	BT::BehaviorTreeFactory factory;
	// 1- 注册叶子节点
	_registerNodes(factory),
	// 2- 创建行为树
	_loadTree(factory, filePath);
	// 3- 初始化行为树
	_initParams();
	// 4-连接Groot2
	//BT::Groot2Publisher publisher(m_tree):
}

void TankTree::_registerNodes(BT::BehaviorTreeFactory& factory)
{
	// 条件节点绑定回调函数
	factory.registerNodeType<checkstatus>("CheckStatus");
	// 动作节点绑定回调函数
	factory.registerNodeType<statusTrans>("StatusTrans");
}

void TankTree::_loadTree(BT::BehaviorTreeFactory& factory, const char* filePath)
{
	m_tree = factory.createTreeFromFile(filePath);
}

void TankTree::_initParams()
{
	// 初始化黑板中的数据
	auto blackboard = m_tree.rootBlackboard();
	// 状态
	blackboard->set("b_status", 5);
	// 输出参数
	blackboard->set("output", m_vec);
	// 测试
	int b status = blackboard->get<int>("b_status");
	std::cout << "Init | b_status:" << b status << std::endl;
}

// 状态转换节点
class StatusTrans : public BT::SyncActionNode
{
public:
	StatusTrans(const std::string& name, const BT::Nodeconfig& config) : BT::SyncActionNode(name, config) {}

	static BT::PortsList providedPorts() // 对应页面编辑的Port
	{
		return
		{
			BT::0utputPort<int>("status"),
			BT::InputPort<int>("set_status")
		};
	}

	BT::Nodestatus tick()override
	{
		// 用户自定义
		int set_status = getInput<int>("set_status").value();
		setoutput("status", set_status);
		// 用户自定义
		return BT::Nodestatus::SUCCESS;
	}
};

// 状态转换节点
class StatusTrans : public BT::StatefulActionNode
{
public:
	StatusTrans(const std::string& name, const BT::Nodeconfig& config) : BT::StatefulActionNode(name, config)
	{
		m_halted = false;
	}

	BT::Nodestatus onstart()//开始
	{
		return BT::Nodestatus::SUCCESS;
	}

	BT::Nodestatus onRunning()//执行中
	{
		if (m_halted)
		{
			return BT::Nodestatus::FAILURE;
		}
		if (condition)
		{
			return BT::Nodestatus::SUCCESS;
		}
		return BT::Nodestatus::RUNNING;
	}

	void onHalted()//中断
	{
		if (condition)
			m_halted = true;
	}

	static BT::PortsList providedPorts()
	{
		return
		{
			BT::0utputPort<int>("status"),
			BT::InputPort<int>("set_status")
		};
	}
private:
	bool m_halted;
}

//判断状态
class Checkstatus : public BT::ConditionNode
{
public:
	Checkstatus(const std::string& name, const BT::Nodeconfiguration& config) : BT::conditionNode(name, config) {}

	static BT::PortsList providedPorts()
	{
		return
		{
			BT::InputPort<int>("status"),
			BT::InputPort<int>("compare_status");
		};
	}

	BT::Nodestatus tick() override
	{
		int status = getInput<int>("status").value();
		int compare_status = getInput<int>("compare_status").value();
		if (compare_status == status)
		{
			return BT::Nodestatus::SUCCESS;
		}
		return BT::Nodestatus::FAILURE;
	}
};