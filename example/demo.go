package main

import "github.com/scbizu/report"

func main() {
	doc := report.NewDoc()
	err := doc.InitDoc("report.doc")
	if err != nil {
		panic(err)
	}
	defer doc.CloseReport()
	doc.WriteHead()
	image1 := report.NewImage("1.gif", "../images/titlepic.gif", 50.00, 50.00, "")
	doc.WriteImage(true, "六壬网安'风险评估'安全评估报告", image1)
	doc.WriteTitle3(report.NewText("                               ———Web应用扫描"))
	doc.WriteTitle2WithGrayBg("1.综述")
	tdimage1 := report.NewImage("11.gif", "../images/netrisk_dangerous.gif", 50.00, 50.00, "")
	td0 := report.NewTableTD([]interface{}{report.NewText("任务名称")})
	td1 := report.NewTableTD([]interface{}{report.NewText("{{task_name}}")})
	td2 := report.NewTableTD([]interface{}{report.NewText("扫描模板")})
	td3 := report.NewTableTD([]interface{}{report.NewText("{{policy_name}}")})
	td4 := report.NewTableTD([]interface{}{report.NewText("Web风险")})
	td5 := report.NewTableTD([]interface{}{tdimage1, report.NewText("风险值:6.9")})
	td6 := report.NewTableTD([]interface{}{report.NewText("域名统计")})
	td7 := report.NewTableTD([]interface{}{report.NewText("已扫描域名数：1 "), report.NewText("非常危险域名：0")})
	td8 := report.NewTableTD([]interface{}{report.NewText("信息统计")})
	td9 := report.NewTableTD([]interface{}{report.NewText("已扫描的文件：213"), report.NewText("有漏洞的文件：72"), report.NewText("已扫描的链接：216")})
	td10 := report.NewTableTD([]interface{}{report.NewText("时间统计")})
	td11 := report.NewTableTD([]interface{}{report.NewText("开始：2011-11-09 15:51:00"), report.NewText("结束：2011-11-09 18:08:35"), report.NewText("耗时：2 小时17 分35 秒")})
	table := [][]*report.TableTD{
		{td0, td1},
		{td2, td3},
		{td4, td5},
		{td6, td7},
		{td8, td9},
		{td10, td11}}
	trSpan := []int{0, 0, 0, 0, 0, 0}
	tdw := []int{4190, 4190, 4190, 4190, 4190, 4190, 4190, 4190, 4190, 4190, 4190, 4190}
	tableObj := report.NewTable(false, table, nil, nil, trSpan, tdw)
	doc.WriteTable(tableObj)

	doc.WriteTitle3(report.NewText("1.1 具有最多安全性问题的文件(TOP5)"))
	tableHead := [][]interface{}{{report.NewText("URL")}, {report.NewText("漏洞数量")}}
	table = [][]*report.TableTD{
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/Article_Class.asp")}), report.NewTableTD([]interface{}{report.NewText("13")})},
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/Article_ClassC.asp")}), report.NewTableTD([]interface{}{report.NewText("8")})},
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/video_xwlb.asp")}), report.NewTableTD([]interface{}{report.NewText("8")})},
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/video_ttbb.asp")}), report.NewTableTD([]interface{}{report.NewText("7")})},
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/imgchange.asp")}), report.NewTableTD([]interface{}{report.NewText("7")})}}
	trSpan = []int{0, 0, 0, 0, 0}
	tdw = []int{5587, 2793, 5587, 2793, 5587, 2793, 5587, 2793, 5587, 2793}
	thw := []int{5587, 2793}
	tableObj = report.NewTable(true, table, tableHead, thw, trSpan, tdw)
	doc.WriteTable(tableObj)

	doc.WriteTitle3(report.NewText("1.2 访问时间最慢的url(TOP5)"))
	tableHead = [][]interface{}{{report.NewText("URL")}, {report.NewText("访问时间")}}
	table = [][]*report.TableTD{
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/Article_Class.asp")}), report.NewTableTD([]interface{}{report.NewText("13")})},
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/Article_ClassC.asp")}), report.NewTableTD([]interface{}{report.NewText("8")})},
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/video_xwlb.asp")}), report.NewTableTD([]interface{}{report.NewText("8")})},
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/video_ttbb.asp")}), report.NewTableTD([]interface{}{report.NewText("7")})},
		{report.NewTableTD([]interface{}{report.NewText("http://www.xjbtw.com/imgchange.asp")}), report.NewTableTD([]interface{}{report.NewText("6")})}}
	trSpan = []int{0, 0, 0, 0, 0}
	tdw = []int{5587, 2793, 5587, 2793, 5587, 2793, 5587, 2793, 5587, 2793}
	thw = []int{5587, 2793}
	tableObj = report.NewTable(true, table, tableHead, thw, trSpan, tdw)
	doc.WriteTable(tableObj)

	doc.WriteTitle3(report.NewText("1.3 Web风险分布统计"))
	image2 := report.NewImage("1.png", "../images/offlineWS-102-risk.png", 110.00, 200.00, "")
	image3 := report.NewImage("2.png", "../images/offlineWS-102-url.png", 110.00, 200.00, "")
	doc.WriteImage(false, "", image2, image3)
	doc.WriteBR()

	doc.WriteTitle2WithGrayBg("2. 目标风险等级列表")
	intableImage := report.NewImage("5.gif", "../images/fcwx.gif", 50.00, 50.00, "")
	intableImage2 := report.NewImage("6.gif", "../images/fcwx.gif", 50.00, 50.00, "")
	tableHead = [][]interface{}{{report.NewText("目标")}, {report.NewText("紧急")}, {report.NewText("紧急")}, {report.NewText("中风险")}, {report.NewText("中风险")}, {report.NewText("中风险")}, {report.NewText("中风险")}}
	table = [][]*report.TableTD{
		{report.NewTableTD([]interface{}{intableImage, report.NewText("192.168.168.250")}), report.NewTableTD([]interface{}{report.NewText("192.168.168.250")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("1")})},
		{report.NewTableTD([]interface{}{intableImage2, report.NewText("192.168.168.250")}), report.NewTableTD([]interface{}{report.NewText("192.168.168.250")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("7")}), report.NewTableTD([]interface{}{report.NewText("10")}), report.NewTableTD([]interface{}{report.NewText("10")})}}
	trSpan = []int{0, 0}
	thw = []int{1204, 1196, 1196, 1196, 1196, 1196, 1196}
	tdw = []int{1204, 1196, 1196, 1196, 1196, 1196, 1196,
		1204, 1196, 1196, 1196, 1196, 1196, 1196}
	tableObj = report.NewTable(true, table, tableHead, thw, trSpan, tdw)
	doc.WriteTable(tableObj)
	doc.WriteBR()

	doc.WriteTitle3WithGrayBg("3. 漏洞风险类别分布")
	image4 := report.NewImage("3.png", "../images/offlineWS-102-1267308e465963bec7d4c63afbb8cd5b-1004.png", 300.00, 500.00, "")

	doc.WriteImage(false, "", image4)
	tableHead = [][]interface{}{{report.NewText("分类名")}, {report.NewText("高风险")}, {report.NewText("中风险")}, {report.NewText("低风险")}, {report.NewText("总计")}}
	table = [][]*report.TableTD{
		{report.NewTableTD([]interface{}{report.NewText("逻辑攻击类型:功能滥用")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("1")})},
		{report.NewTableTD([]interface{}{report.NewText("命令执行类型:SQL注入")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("0")})},
		{report.NewTableTD([]interface{}{report.NewText("信息泄露类型:资源位置可预测")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("3")}), report.NewTableTD([]interface{}{report.NewText("3")})},
		{report.NewTableTD([]interface{}{report.NewText("信息泄露类型:信息泄露")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("3")}), report.NewTableTD([]interface{}{report.NewText("3")})},
		{report.NewTableTD([]interface{}{report.NewText("其他")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("0")}), report.NewTableTD([]interface{}{report.NewText("1")})}}
	trSpan = []int{0, 0, 0, 0, 0}
	thw = []int{1676, 1676, 1676, 1676, 1676}
	tdw = []int{1676, 1676, 1676, 1676, 1676,
		1676, 1676, 1676, 1676, 1676,
		1676, 1676, 1676, 1676, 1676,
		1676, 1676, 1676, 1676, 1676}
	tableObj = report.NewTable(true, table, tableHead, thw, trSpan, tdw)
	doc.WriteTable(tableObj)
	cText := report.NewText("4.1.5: 漏洞信息")
	// cText.SetSize("15")
	doc.WriteTitle3(cText)
	intableImage3 := report.NewImage("10.gif", "../images/move_down.gif", 50, 50, "http://blog.scnace.cc/")
	titd0 := report.NewTableTD([]interface{}{report.NewText("请求方式")})
	titd0.SetTableTDBG()
	titd2 := report.NewTableTD([]interface{}{report.NewText("URL")})
	titd2.SetTableTDBG()
	titd4 := report.NewTableTD([]interface{}{report.NewText("问题参数")})
	titd4.SetTableTDBG()
	titd6 := report.NewTableTD([]interface{}{report.NewText("参考（验证）")})
	titd6.SetTableTDBG()
	tit := [][]*report.TableTD{
		{titd0, report.NewTableTD([]interface{}{report.NewText("GET")})},
		{titd2, report.NewTableTD([]interface{}{report.NewText(`http://www.xjbtw.com/Link_Class.asp?class_id_int=5`)})},
		{titd4, report.NewTableTD([]interface{}{report.NewText("class_id_int")})},
		{titd6, report.NewTableTD([]interface{}{report.NewText(`http://www.xjbtw.com/Link_Class.asp?class_id_int`)})}}
	tableHead = [][]interface{}{{report.NewText("漏洞名称")}, {report.NewText("出现次数")}, {report.NewText("详情解决方法")}}
	redFont := report.NewText("检测到目标URL存在SQL注入漏洞")
	redFont.Setcolor("ef1515")
	table = [][]*report.TableTD{
		{report.NewTableTD([]interface{}{redFont}), report.NewTableTD([]interface{}{report.NewText("1")}), report.NewTableTD([]interface{}{intableImage3})},
		// BUG: 注意'%^'需要转义! 否则填充会有BUG...
		{report.NewTableTD([]interface{}{`http://www.xjbtw.com/Link_Class.asp?class_id_int=5`, tit})}}
	tdw = []int{4587, 1793, 2000, 8380}
	thw = []int{4587, 1793, 2000}
	trSpan = []int{0, 3}
	tableObj = report.NewTable(false, table, tableHead, thw, trSpan, tdw)
	doc.WriteTable(tableObj)
	// ENDHEAD  and set page header or page footer
	doc.WriteEndHead(false, true, "")
}
