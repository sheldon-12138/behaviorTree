//判据结构
export default function Criterion(path, type, name, aliasName, unit) {
    this.id = ++Criterion.prototype.amount; //判据id
    this.path = path; //图片路径
    this.type = type; //判据类型（英文）
    this.name = name || ""; //判据类型中文名称
    this.aliasName = aliasName || ""; //别名（暂时没有）
    this.unit = unit || ""; //单位
    this.selectNames = {};
    this.chartList = {
        //key:dc_id,value:{dcd_type:{data:[0:[],1:[]...],style:}, dc_name:中文名}
    }
    this.selectDcList = []
}
Criterion.prototype.amount = 0;
