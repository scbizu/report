package report

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
)

//Report implement the os.File
type Report struct {
	Doc *os.File
}

//Text include text configuration
type Text struct {
	Words    string `json:"word"`
	Color    string `json:"color"`
	Size     string `json:"size"`
	Isbold   bool   `json:"isbold"`
	IsCenter bool   `json:"iscenter"`
}

//Image include image configuration.
type Image struct {
	//This image will link to ?
	Hyperlink string `json:"hyperlink"`
	//destination of the URI in WORD (where it will go to?)
	URIDist string `json:"uridist"`
	//source of the image
	ImageSrc string `json:"imagesrc"`
	//image height  (pixel)
	Height float64 `json:"height"`
	//image width  (pixel)
	Width float64 `json:"width"`
	//Zoom image     (pixel)  You'd bette not to change this default value
	CoordsizeX int `json:"coordsizeX"`
	//Zoom
	CoordsizeY int `json:"coordsizeY"`
}

//TableTD descripes every block of the table
type TableTD struct {
	//TData refers block's element
	TData []interface{} `json:"tdata"`
	//TDBG refers block's background
	TDBG bool `json:"tdbg"`
}

//Table include table configuration.
type Table struct {
	//Tbname  is the name of the table
	Tbname string `json:"tbname"`
	//Text OR Image in the sanme line
	Inline bool `json:"inline"`
	//Table data except table head
	TableBody [][]*TableTD `json:"tablebody"`
	//Table head data
	TableHead [][]interface{} `json:"tablehead"`
	// NOTE: Because of  the title line ,the Total width is 8380.
	//Table head width,you should  list all width inside the table head          (pixel)
	Thw []int `json:"thw"`
	//Table body width ,you should list all width inside the table body     (pixel)
	Tdw []int `json:"tdw"`
	///////////////////////////////////////////////////////////
	//you can merge cells use GridSpan ,if you need not ,just set 0.
	GridSpan []int `json:"gridspan"`
	//Thcenter set table head center word
	Thcenter bool `json:"thcenter"`
}

//NewDoc new a Document
func NewDoc() *Report {
	return &Report{}
}

//InitDoc init the MS doc file ,don't forget to close.
func (doc *Report) InitDoc(filename string) error {
	file, err := os.OpenFile(filename, os.O_WRONLY, os.ModeAppend)
	if err != nil {
		file, err = os.Create(filename)
		if err != nil {
			return err
		}
		doc.Doc = file
		return nil
	}
	doc.Doc = file
	return err
}

//WriteHead init the header
func (doc *Report) WriteHead() error {
	_, err := doc.Doc.WriteString(XMLHead)
	if err != nil {
		return err
	}
	// color.Blue("[LOG]:WriteHead wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteEndHead end the Header
/////@Params ftrmode:
//"pages":For page index
//"text" :For footer  text
//others :none
func (doc *Report) WriteEndHead(sethdr bool, ftrmode string, hdr string, ftr string) error {
	_, err := doc.Doc.WriteString(XMLSectBegin)
	if err != nil {
		return err
	}
	//set HDR
	if sethdr {
		doc.writehdr(hdr)
	}
	//set FTR
	if ftrmode != "" {
		doc.writeftr(ftrmode, ftr)
	}

	_, err = doc.Doc.WriteString(XMLSectEnd)
	if err != nil {
		return err
	}
	doc.Doc.WriteString(XMLEndHead)

	return nil
}

//WriteTitle == 居中大标题
func (doc *Report) WriteTitle(text *Text) error {
	color := text.Color
	word := text.Words
	Title := fmt.Sprintf(XMLTitle, color, word)
	_, err := doc.Doc.WriteString(Title)
	if err != nil {
		return err
	}

	return nil
}

//WriteTitle1 == 标题1的格式
func (doc *Report) WriteTitle1(text *Text) error {
	color := text.Color
	word := text.Words
	Title1 := fmt.Sprintf(XMLTitle1, color, word)
	_, err := doc.Doc.WriteString(Title1)
	if err != nil {
		return err
	}

	return nil
}

//WriteTitle2 == 标题2的格式
func (doc *Report) WriteTitle2(text *Text) error {
	color := text.Color
	word := text.Words
	Title2 := fmt.Sprintf(XMLTitle2, color, word)
	_, err := doc.Doc.WriteString(Title2)
	if err != nil {
		return err
	}
	return nil
}

//WriteTitle2WithGrayBg == 灰色panel背景的标题2
func (doc *Report) WriteTitle2WithGrayBg(text string) error {
	Title2Gray := fmt.Sprintf(XMLTitle2WithGrayBg, text)
	_, err := doc.Doc.WriteString(Title2Gray)
	if err != nil {
		return err
	}
	//color.Blue("[LOG]:WriteTitle2WithGrayBg Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteTitle3 == 标题3的格式
func (doc *Report) WriteTitle3(text *Text) error {
	color := text.Color
	word := text.Words
	Title3 := fmt.Sprintf(XMLTitle3, color, word)
	_, err := doc.Doc.WriteString(Title3)
	if err != nil {
		return err
	}
	//color.Blue("[LOG]:WriteTitle3 Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteTitle3WithGrayBg == 灰色panel背景的标题3
func (doc *Report) WriteTitle3WithGrayBg(text string) error {
	Title3Gray := fmt.Sprintf(XMLTitle3WithGrayBg, text)
	_, err := doc.Doc.WriteString(Title3Gray)
	if err != nil {
		return err
	}
	//color.Blue("[LOG]:WriteTitle2WithGrayBg Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteText == 正文的格式
func (doc *Report) WriteText(text *Text) error {
	color := text.Color
	size := text.Size
	word := text.Words
	var Text string
	if text.IsCenter {
		if text.Isbold {
			Text = fmt.Sprintf(XMLCenterBoldText, color, size, size, word)
		} else {
			Text = fmt.Sprintf(XMLCenterText, color, size, size, word)
		}
	} else {
		if text.Isbold {
			Text = fmt.Sprintf(XMLBoldText, color, size, size, word)
		} else {
			Text = fmt.Sprintf(XMLText, color, size, size, word)
		}
	}
	_, err := doc.Doc.WriteString(Text)
	if err != nil {
		return err
	}
	//color.Blue("[LOG]:WriteText Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteBR == 换行
func (doc *Report) WriteBR() error {
	_, err := doc.Doc.WriteString(XMLBr)
	if err != nil {
		return err
	}
	return nil
}

//WriteTable  ==表格的格式
func (doc *Report) WriteTable(table *Table) error {
	XMLTable := bytes.Buffer{}
	tbname := table.Tbname
	inline := table.Inline
	tableBody := table.TableBody
	tableHead := table.TableHead
	thw := table.Thw
	gridSpan := table.GridSpan
	tdw := table.Tdw
	var used bool
	used = false
	//handle TableHead :Split with TableBody
	if tableHead != nil {
		tablehead := fmt.Sprintf(XMLTableHead, tbname)
		XMLTable.WriteString(tablehead)
		XMLTable.WriteString(XMLTableHeadTR)
		for thindex, rowdata := range tableHead {
			thw := fmt.Sprintf(XMLHeadTableTDBegin, strconv.FormatInt(int64(thw[thindex]), 10))
			XMLTable.WriteString(thw)
			if inline {
				if table.Thcenter {
					XMLTable.WriteString(XMLHeadTableTDBegin2C)
				} else {
					XMLTable.WriteString(XMLHeadTableTDBegin2)
				}
			}
			for _, rowEle := range rowdata {
				if !inline {
					if table.Thcenter {
						XMLTable.WriteString(XMLHeadTableTDBegin2C)
					} else {
						XMLTable.WriteString(XMLHeadTableTDBegin2)
					}
				}
				if image, ok := rowEle.(*Image); ok {
					//rowEle is a resource
					str, err := writeImageToBuffer(image)
					if err != nil {
						return err
					}
					XMLTable.WriteString(str)
				} else if text, ok := rowEle.(*Text); ok {
					//not
					color := text.Color
					size := text.Size
					word := text.Words
					var data string
					if text.IsCenter {
						if text.Isbold {
							data = fmt.Sprintf(XMLHeadtableTDTextBC, color, size, size, word)
						} else {
							data = fmt.Sprintf(XMLHeadtableTDTextC, color, size, size, word)
						}
					} else {
						if text.Isbold {
							data = fmt.Sprintf(XMLHeadtableTDTextB, color, size, size, word)
						} else {
							data = fmt.Sprintf(XMLHeadtableTDText, color, size, size, word)
						}
					}
					XMLTable.WriteString(data)
				}
				if !inline {
					XMLTable.WriteString(XMLIMGtail)
				}
			}
			if inline {
				XMLTable.WriteString(XMLIMGtail)
			}
			XMLTable.WriteString(XMLHeadTableTDEnd)
		}
		XMLTable.WriteString(XMLTableEndTR)
	} else {
		nohead := fmt.Sprintf(XMLTableNoHead, tbname)
		XMLTable.WriteString(nohead)
	}
	//Generate formation
	for k, v := range tableBody {

		XMLTable.WriteString(XMLTableTR)

		for kk, vv := range v {
			//td bg
			var td string
			if vv.TDBG {
				//Span formation
				td = fmt.Sprintf(XMLTableTD, strconv.FormatInt(int64(tdw[kk]), 10), "E7E6E6", strconv.FormatInt(int64(gridSpan[k]), 10))
			} else {
				//Span formation
				td = fmt.Sprintf(XMLTableTD, strconv.FormatInt(int64(tdw[kk]), 10), "auto", strconv.FormatInt(int64(gridSpan[k]), 10))
			}
			XMLTable.WriteString(td)
			tds := 0

			// vv.TData = append(vv.TData, "")
			if inline {
				XMLTable.WriteString(XMLTableTD2)

			}
			for _, vvv := range vv.TData {
				table, ok := vvv.(*Table)
				if !inline && !ok {
					XMLTable.WriteString(XMLTableTD2)
				}

				//if td is a table
				if ok {
					if inline {
						XMLTable.WriteString(XMLIMGtail)
					}
					//end with table
					used = true
					tablestr, err := writeTableToBuffer(table)
					if err != nil {
						return err
					}
					XMLTable.WriteString(tablestr)
					// FIXME: magic operation
					XMLTable.WriteString(XMLMagicFooter)
					//image or text
				} else {
					if icon, ko := vvv.(*Image); ko {
						if icon.Hyperlink != "" {
							XMLTable.WriteString(XMLImageLinkTitle)
						}
						XMLTable.WriteString(XMLIcon)
						if icon.Hyperlink != "" {
							XMLTable.WriteString(XMLImageLinkEnd)
						}
					} else if text, ko := vvv.(*Text); ko {
						if text.IsCenter {
							if text.Isbold {
								XMLTable.WriteString(XMLHeadtableTDTextBC)
							} else {
								XMLTable.WriteString(XMLHeadtableTDTextC)
							}
						} else {
							if text.Isbold {
								XMLTable.WriteString(XMLHeadtableTDTextB)
							} else {
								XMLTable.WriteString(XMLHeadtableTDText)
							}
						}
					}
					//not end with table
					used = false
					// var next bool
					// if kk < len(vv.TData)-1 {
					// 	_, next = vv.TData[tds+1].(*Table)
					// }

					if !inline {
						XMLTable.WriteString(XMLIMGtail)
					}
					// else if inline && next {
					// 	XMLTable.WriteString(XMLIMGtail)
					// }
				}
				tds++
			}
			//not end with table
			if inline && !used {
				XMLTable.WriteString(XMLIMGtail)
				//reset inline flag
				// inline = false
			}
			XMLTable.WriteString(XMLHeadTableTDEnd)
		}
		XMLTable.WriteString(XMLTableEndTR)
	}
	XMLTable.WriteString(XMLTableFooter)
	//serialization
	var rows []interface{}

	for _, row := range tableBody {
		for _, rowdata := range row {
			for _, rowEle := range rowdata.TData {
				if _, ok := rowEle.([][][]interface{}); !ok {
					if icon, ok := rowEle.(*Image); ok {
						//图片
						imageSrc := icon.ImageSrc
						bindata, err := getImagedata(imageSrc)
						URI := "wordml://" + icon.URIDist
						if err != nil {
							return err
						}

						if icon.Hyperlink != "" {
							rows = append(rows, icon.Hyperlink, URI, bindata, filepath.Base(imageSrc), URI, filepath.Base(imageSrc))
						} else {
							rows = append(rows, URI, bindata, filepath.Base(imageSrc), URI, filepath.Base(imageSrc))
						}
					} else if text, ok := rowEle.(*Text); ok {
						tColor := text.Color
						tSize := text.Size
						tWord := text.Words
						rows = append(rows, tColor, tSize, tSize, tWord)
					}
				}
			}
		}
	}

	//data fill in
	tabledata := fmt.Sprintf(XMLTable.String(), rows...)

	_, err := doc.Doc.WriteString(tabledata)
	if err != nil {
		return err
	}
	return nil
}

//WriteImage == 写入图片
func (doc *Report) WriteImage(withtext bool, text string, imagesData ...*Image) error {
	xmlimage := bytes.Buffer{}
	//write fontStyle

	xmlimage.WriteString(XMLIMGTitle)
	if withtext {
		//偷个懒  指定为1
		fontStyle := fmt.Sprintf(XMLFontStyle, "1")
		xmlimage.WriteString(fontStyle)
	}
	for _, imagedata := range imagesData {
		imageSrc := imagedata.ImageSrc
		URIDist := imagedata.URIDist
		coordsizeX := imagedata.CoordsizeX
		coordsizeY := imagedata.CoordsizeY
		height := imagedata.Height
		width := imagedata.Width
		hyperlink := imagedata.Hyperlink
		//embedding hyperlink
		if hyperlink != "" {
			imageLink := fmt.Sprintf(XMLImageLinkTitle, hyperlink)
			xmlimage.WriteString(imageLink)
		}
		bindata, err := getImagedata(imageSrc)
		if err != nil {
			return err
		}
		URI := "wordml://" + URIDist
		imageSec := fmt.Sprintf(XMLImage, URI, bindata, filepath.Base(imageSrc), strconv.FormatFloat(height, 'f', -1, 64),
			strconv.FormatFloat(width, 'f', -1, 64), strconv.Itoa(coordsizeY), strconv.Itoa(coordsizeX), URI, filepath.Base(imageSrc))
		xmlimage.WriteString(imageSec)
		//hyper link
		if hyperlink != "" {
			xmlimage.WriteString(XMLImageLinkEnd)
		}
	}
	if withtext {
		inlineText := fmt.Sprintf(XMLInlineText, text)
		xmlimage.WriteString(inlineText)
	}
	xmlimage.WriteString(XMLIMGtail)
	doc.Doc.WriteString(xmlimage.String())
	return nil
}

//writeImageToBuffer write image xml to buffer and return.
func writeImageToBuffer(image *Image) (string, error) {
	ResImage := bytes.Buffer{}
	// xmlimage := bytes.Buffer{}
	// xmlimage.WriteString(XMLIMGTitle)
	if image.Hyperlink != "" {
		ResImage.WriteString(XMLImageLinkTitle)
	}
	imageSrc := image.ImageSrc
	URI := "wordml://" + image.URIDist

	bindata, err := getImagedata(imageSrc)
	if err != nil {
		return "", err
	}
	imageSec := fmt.Sprintf(XMLIcon, URI, bindata, filepath.Base(imageSrc), URI, filepath.Base(imageSrc))
	ResImage.WriteString(imageSec)
	ResImage.WriteString(XMLImageLinkEnd)
	return ResImage.String(), nil
}

//Generate table xml string formation  ~> 用于 表中再次嵌入表格时的填充
func writeTableToBuffer(table *Table) (string, error) {
	tbname := table.Tbname
	tableHead := table.TableHead
	tableBody := table.TableBody
	inline := table.Inline
	thw := table.Thw
	tdw := table.Tdw
	XMLTable := bytes.Buffer{}
	var Bused bool
	Bused = false
	//handle TableHead :Split with TableBody
	if tableHead != nil {
		//表格中的表格为无边框形式
		tablehead := fmt.Sprintf(XMLTableInTableHead, tbname)
		XMLTable.WriteString(tablehead)
		XMLTable.WriteString(XMLTableHeadTR)
		for thindex, rowdata := range tableHead {
			thw := fmt.Sprintf(XMLHeadTableTDBegin, strconv.FormatInt(int64(thw[thindex]), 10))
			XMLTable.WriteString(thw)
			if inline {
				if table.Thcenter {
					XMLTable.WriteString(XMLHeadTableTDBegin2C)
				} else {
					XMLTable.WriteString(XMLHeadTableTDBegin2)
				}
			}
			for _, rowEle := range rowdata {
				if !inline {
					if table.Thcenter {
						XMLTable.WriteString(XMLHeadTableTDBegin2C)
					} else {
						XMLTable.WriteString(XMLHeadTableTDBegin2)
					}
				}
				if image, ok := rowEle.(*Image); ok {
					//rowEle is a resource
					str, err := writeImageToBuffer(image)
					if err != nil {
						return "", err
					}
					XMLTable.WriteString(str)
				} else if text, ok := rowEle.(*Text); ok {
					//not
					color := text.Color
					size := text.Size
					word := text.Words
					var data string
					if text.IsCenter {
						// println(text.IsCenter)
						if text.Isbold {
							// println(text.Isbold)
							data = fmt.Sprintf(XMLHeadtableTDTextBC, color, size, size, word)
						} else {
							data = fmt.Sprintf(XMLHeadtableTDTextC, color, size, size, word)
						}
					} else {
						if text.Isbold {
							data = fmt.Sprintf(XMLHeadtableTDTextB, color, size, size, word)
						} else {
							data = fmt.Sprintf(XMLHeadtableTDText, color, size, size, word)
						}
					}
					XMLTable.WriteString(data)
				}
				if !inline {
					XMLTable.WriteString(XMLIMGtail)
				}
			}
			if inline {
				XMLTable.WriteString(XMLIMGtail)
			}
			XMLTable.WriteString(XMLHeadTableTDEnd)
		}
		XMLTable.WriteString(XMLTableEndTR)
	} else {
		nohead := fmt.Sprintf(XMLTableInTableNoHead, tbname)
		XMLTable.WriteString(nohead)
	}

	//Generate formation
	for _, v := range tableBody {
		XMLTable.WriteString(XMLTableTR)

		for kk, vv := range v {

			var ttd string
			if vv.TDBG {
				//fill with gray
				ttd = fmt.Sprintf(XMLTableInTableTD, strconv.FormatInt(int64(tdw[kk]), 10), "E7E6E6")
			} else {
				ttd = fmt.Sprintf(XMLTableInTableTD, strconv.FormatInt(int64(tdw[kk]), 10), "auto")
			}
			XMLTable.WriteString(ttd)

			tds := 0
			// vv.TData = append(vv.TData, "")
			if inline {
				XMLTable.WriteString(XMLTableTD2)

			}
			for _, vvv := range vv.TData {
				table, ok := vvv.(*Table)
				if !inline && !ok {
					XMLTable.WriteString(XMLTableTD2)
				}

				//if td is a table
				if ok {
					//end with table
					Bused = true
					tablestr, err := writeTableToBuffer(table)
					if err != nil {
						return "", err
					}
					XMLTable.WriteString(tablestr)
					// FIXME: magic operation
					XMLTable.WriteString(XMLMagicFooter)
					//image or text
				} else {
					if icon, ko := vvv.(*Image); ko {
						if icon.Hyperlink != "" {
							XMLTable.WriteString(XMLImageLinkTitle)
						}
						XMLTable.WriteString(XMLIcon)
						if icon.Hyperlink != "" {
							XMLTable.WriteString(XMLImageLinkEnd)
						}
					} else if text, ko := vvv.(*Text); ko {
						if text.IsCenter {
							if text.Isbold {
								XMLTable.WriteString(XMLHeadtableTDTextBC)
							} else {
								XMLTable.WriteString(XMLHeadtableTDTextC)
							}
						} else {
							if text.Isbold {
								XMLTable.WriteString(XMLHeadtableTDTextB)
							} else {
								XMLTable.WriteString(XMLHeadtableTDText)
							}
						}
					}
					//not end with table
					Bused = false
					var next bool
					if tds < len(vv.TData)-1 {
						_, next = vv.TData[tds+1].(*Table)
					}

					if !inline {
						XMLTable.WriteString(XMLIMGtail)
					} else if inline && next {
						XMLTable.WriteString(XMLIMGtail)
					}
				}
				tds++
			}
			//not end with table
			if inline && !Bused {
				XMLTable.WriteString(XMLIMGtail)
				//reset inline flag
				// inline = false
			}
			XMLTable.WriteString(XMLHeadTableTDEnd)

		}
		XMLTable.WriteString(XMLTableEndTR)
	}
	XMLTable.WriteString(XMLTableFooter)
	//serialization
	var rows []interface{}

	for _, row := range tableBody {
		for _, rowdata := range row {
			for _, rowEle := range rowdata.TData {
				if _, ok := rowEle.([][][]interface{}); !ok {
					if icon, ok := rowEle.(*Image); ok {
						//图片
						imageSrc := icon.ImageSrc
						bindata, err := getImagedata(imageSrc)
						URI := "wordml://" + icon.URIDist
						if err != nil {
							return "", err
						}

						if icon.Hyperlink != "" {
							rows = append(rows, icon.Hyperlink, URI, bindata, filepath.Base(imageSrc), URI, filepath.Base(imageSrc))
						} else {
							rows = append(rows, URI, bindata, filepath.Base(imageSrc), URI, filepath.Base(imageSrc))
						}
					} else if text, ok := rowEle.(*Text); ok {
						tColor := text.Color
						tSize := text.Size
						tWord := text.Words
						rows = append(rows, tColor, tSize, tSize, tWord)
					}
				}
			}
		}
	}

	//data fill in
	tabledata := fmt.Sprintf(XMLTable.String(), rows...)

	return tabledata, nil
}

//get bindata
func getImagedata(src string) (string, error) {
	file, err := os.Open(src)
	if err != nil {
		return "", err
	}
	defer file.Close()
	//Get bindata , encode via Base64
	finfo, _ := file.Stat()
	size := finfo.Size()
	buf := make([]byte, size)
	encoder := bufio.NewReader(file)
	encoder.Read(buf)
	bindata := base64.StdEncoding.EncodeToString(buf)
	return bindata, nil
}

//writehdr ==页眉格式  wrap fucntion
func (doc *Report) writehdr(text string) error {
	hdr := fmt.Sprintf(XMLhdr, text)
	_, err := doc.Doc.WriteString(hdr)
	if err != nil {
		return err
	}
	//color.Blue("[LOG]:WriteTitle1 Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//writeftr == 页脚  wrap function
/////MODE :
//"pages":For page index
//"text" :For footer  text
//others :none
func (doc *Report) writeftr(mode string, text string) error {
	switch mode {
	case "pages":
		_, err := doc.Doc.WriteString(XMLftrPages)
		if err != nil {
			return err
		}
	case "text":
		ftrtext := fmt.Sprintf(XMLftrText, text)
		_, err := doc.Doc.WriteString(ftrtext)
		if err != nil {
			return err
		}
	default:
		return errors.New("Unknown Footer Mode :(")
	}

	// color.Blue("[LOG]:WriteTitle1 Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

// if the str is a resource file
// BUG: other resorce can not be imported
func isResource(str string) bool {
	file, err := os.Open(str)
	if err != nil {
		return false
	}
	defer file.Close()
	return true
}

//NewImage init a image with fixed CoordsizeX & CoordsizeY
func NewImage(URIdist string, imageSrc string, height float64, width float64, hyperlink string) *Image {
	img := &Image{}
	img.URIDist = URIdist
	img.ImageSrc = imageSrc
	img.Height = height
	img.Width = width
	img.CoordsizeX = 21600
	img.CoordsizeY = 21600
	img.Hyperlink = hyperlink
	return img
}

//NewTable create a table
func NewTable(tbname string, inline bool, tableBody [][]*TableTD, tableHead [][]interface{}, thw []int, gridSpan []int, tdw []int) *Table {
	table := &Table{}
	table.Tbname = tbname
	table.Inline = inline
	table.TableBody = tableBody
	table.TableHead = tableHead
	table.Tdw = tdw
	table.Thw = thw
	table.GridSpan = gridSpan
	table.Thcenter = false
	return table
}

//SetHeadCenter set table head center word
func (tb *Table) SetHeadCenter(center bool) {
	tb.Thcenter = center
}

//NewText create word with default setting
func NewText(words string) *Text {
	text := &Text{}
	text.Words = words
	text.Color = "000000"
	text.Size = "21"
	text.Isbold = false
	text.IsCenter = false
	return text
}

//Setcolor Set Text color
func (tx *Text) Setcolor(color string) {
	tx.Color = color
}

//SetSize set text size
func (tx *Text) SetSize(size string) {
	tx.Size = size
}

//SetBold set bold
func (tx *Text) SetBold(bold bool) {
	tx.Isbold = bold
}

//SetCenter set center  text
func (tx *Text) SetCenter(center bool) {
	tx.IsCenter = center
}

//NewTableTD init table td block
func NewTableTD(tdata []interface{}) *TableTD {
	Tabletd := &TableTD{}
	Tabletd.TData = tdata
	Tabletd.TDBG = false
	return Tabletd
}

//SetTableTDBG set block's color with gray(#E7E6E6)
func (tbtd *TableTD) SetTableTDBG() {
	tbtd.TDBG = true
}

//CloseReport close file handle
func (doc *Report) CloseReport() error {
	return doc.Doc.Close()
}
