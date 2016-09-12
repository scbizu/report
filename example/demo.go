package main

import "practice/report"

func main() {
	var doc report.Report
	err := doc.Newdoc("report.doc")
	if err != nil {
		panic(err)
	}
	defer doc.CloseReport()
	doc.WriteHead()
	image1 := &report.Image{}
	image1.URIDist = "1.gif"
	image1.ImageSrc = "../images/titlepic.gif"
	image1.Height = 50.00
	image1.Width = 50.00
	image1.CoordsizeX = 21600
	image1.CoordsizeY = 21600
	images := []*report.Image{image1}
	doc.WriteImage(images, true, "六壬网安'风险评估'安全评估报告")
	doc.WriteTitle3("                          ———Web应用扫描")
	doc.WriteTitle2WithGrayBg("1.综述")
	table := [][][]interface{}{
		{{"任务名称"}, {"{{task_name}}"}},
		{{"扫描模板"}, {"{{policy_name}}"}},
		{{"Web风险"}, {"../images/netrisk_dangerous.gif", "  风险值:6.9"}},
		{{"域名统计"}, {"  已扫描域名数：1 ", " 非常危险域名：0"}},
		{{"信息统计"}, {" 已扫描的文件：213", "  有漏洞的文件：72", "已扫描的链接：216"}},
		{{"时间统计"}, {"  开始：2011-11-09 15:51:00", " 结束：2011-11-09 18:08:35", " 耗时：2 小时17 分35 秒"}}}
	doc.WriteTable(false, table, nil)

	doc.WriteTitle3("1.1 具有最多安全性问题的文件(TOP5)")
	table = [][][]interface{}{

		{{"http://www.xjbtw.com/Article_Class.asp"}, {"13"}},
		{{"http://www.xjbtw.com/Article_ClassC.asp"}, {"8"}},
		{{"http://www.xjbtw.com/video_xwlb.asp	"}, {"7"}},
		{{"http://www.xjbtw.com/video_ttbb.asp"}, {"7"}},
		{{"http://www.xjbtw.com/imgchange.asp"}, {"6"}}}
	doc.WriteTable(true, table, [][]interface{}{{"URL"}, {"漏洞数量"}})

	doc.WriteTitle3("1.2 访问时间最慢的url(TOP5)")
	table = [][][]interface{}{

		{{"http://www.xjbtw.com/Article_Class.asp"}, {"13"}},
		{{"http://www.xjbtw.com/Article_ClassC.asp"}, {"8"}},
		{{"http://www.xjbtw.com/video_xwlb.asp	"}, {"7"}},
		{{"http://www.xjbtw.com/video_ttbb.asp"}, {"7"}},
		{{"http://www.xjbtw.com/imgchange.asp"}, {"6"}}}
	doc.WriteTable(true, table, [][]interface{}{{"URL"}, {"访问时间"}})

	doc.WriteTitle3("1.3 Web风险分布统计")
	image2 := &report.Image{}
	image2.URIDist = "1.png"
	image2.ImageSrc = "../images/offlineWS-102-risk.png"
	image2.Height = 140.00
	image2.Width = 180.00
	image2.CoordsizeX = 21600
	image2.CoordsizeY = 21600
	image3 := &report.Image{}
	image3.URIDist = "2.png"
	image3.ImageSrc = "../images/offlineWS-102-url.png"
	image3.Height = 140.00
	image3.Width = 180.00
	image3.CoordsizeX = 21600
	image3.CoordsizeY = 21600
	images = []*report.Image{image2, image3}
	doc.WriteImage(images, false, "")
	doc.WriteBR()

	doc.WriteTitle2WithGrayBg("2. 目标风险等级列表")
	table = [][][]interface{}{

		{{"../images/fcwx.gif", "192.168.168.250"}, {"1"}, {"1"}, {"1"}, {"7"}, {"10"}, {"10"}},
		{{"../images/fcwx.gif", "192.168.168.250"}, {"1"}, {"1"}, {"1"}, {"7"}, {"10"}, {"10"}}}
	doc.WriteTable(true, table, [][]interface{}{{"目标"}, {"紧急"}, {"高风险"}, {"中风险"}, {"低风险"}, {"信息"}, {"风险值"}})
	doc.WriteBR()

	doc.WriteTitle2WithGrayBg("3. 漏洞风险类别分布")
	image4 := &report.Image{}
	image4.URIDist = "3.png"
	image4.ImageSrc = "../images/offlineWS-102-1267308e465963bec7d4c63afbb8cd5b-1004.png"
	image4.Height = 300.00
	image4.Width = 500.00
	image4.CoordsizeX = 21600
	image4.CoordsizeY = 21600
	images = []*report.Image{image4}
	doc.WriteImage(images, false, "")
	table = [][][]interface{}{
		{{"逻辑攻击类型:功能滥用"}, {"0"}, {"0"}, {"1"}, {"1"}},
		{{"命令执行类型:SQL注入"}, {"1"}, {"0"}, {"0"}, {"1"}},
		{{"信息泄露类型:资源位置可预测"}, {"0"}, {"0"}, {"3"}, {"3"}},
		{{"信息泄露类型:信息泄露"}, {"0"}, {"0"}, {"3"}, {"3"}},
		{{"其他"}, {"0"}, {"0"}, {"0"}, {"1"}}}
	doc.WriteBR()

	doc.WriteTable(true, table, [][]interface{}{{"分类名"}, {"高风险"}, {"中风险"}, {"低风险"}, {"总计"}})
	// IDEA: ENDHEAD
	doc.WriteEndHead(false, true, "")
}
