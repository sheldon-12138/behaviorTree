export default function TreeNode(id, tagName, attrObj, children) {
    this.id = id
    this.tagName = tagName || ''
    this.attrObj = attrObj || {}
    this.children = [];
    if (children) {
        for (let i = 0; i < children.length; ++i)
            this.children.push(new TreeNode(children[i].id, children[i].tagName, children[i].attrObj, children[i].children));
    }
}