const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');

// 读取XML文件
const xmlFile = 'TreeNodesModel.xml'; // 请将此路径替换为你的XML文件路径

fs.readFile(xmlFile, 'utf-8', (err, data) => {
  if (err) {
    console.error('读取文件时出错:', err);
    return;
  }

  // 解析XML
  xml2js.parseString(data, (err, result) => {
    if (err) {
      console.error('解析XML时出错:', err);
      return;
    }

    // 生成JSON文件名
    const jsonFile = path.basename(xmlFile, path.extname(xmlFile)) + '.json';

    // 将解析结果写入JSON文件
    fs.writeFile(jsonFile, JSON.stringify(result, null, 2), (err) => {
      if (err) {
        console.error('写入JSON文件时出错:', err);
      } else {
        console.log('解析结果已保存到', jsonFile);
      }
    });
  });
});
