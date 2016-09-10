package report

import (
	"bufio"
	"bytes"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
)

//Report implement the os.File
type Report struct {
	Doc *os.File
}

//Image assign all Variable.
type Image struct {
	URIDist    string  `json:"uridist"`
	ImageSrc   string  `json:"imagesrc"`
	Height     float64 `json:"height"`
	Width      float64 `json:"width"`
	CoordsizeX int     `json:"coordsizeX"`
	CoordsizeY int     `json:"coordsizeY"`
}

//Newdoc init the MS doc file ,don't forget to close.
func (doc *Report) Newdoc(filename string) error {
	file, err := os.OpenFile(filename, os.O_APPEND|os.O_WRONLY, os.ModeAppend)
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
func (doc *Report) WriteEndHead(sethdr bool, setftr bool, hdr string) error {
	_, err := doc.Doc.WriteString(XMLSectBegin)
	if err != nil {
		return err
	}
	//set HDR
	if sethdr {
		doc.writehdr(hdr)
	}
	//set FTR
	if setftr {
		doc.writeftr()
	}

	_, err = doc.Doc.WriteString(XMLSectEnd)
	if err != nil {
		return err
	}
	doc.Doc.WriteString(XMLEndHead)
	//color.Blue("[LOG]:WriteEndHead wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteTitle == 居中大标题
func (doc *Report) WriteTitle(text string) error {
	Title := fmt.Sprintf(XMLTitle, text)
	_, err := doc.Doc.WriteString(Title)
	if err != nil {
		return err
	}
	//	color.Blue("[LOG]:WriteTitle Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteTitle1 == 标题1的格式
func (doc *Report) WriteTitle1(text string) error {
	Title1 := fmt.Sprintf(XMLTitle1, text)
	_, err := doc.Doc.WriteString(Title1)
	if err != nil {
		return err
	}
	//color.Blue("[LOG]:WriteTitle1 Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteTitle2 == 标题2的格式
func (doc *Report) WriteTitle2(text string) error {
	Title2 := fmt.Sprintf(XMLTitle2, text)
	_, err := doc.Doc.WriteString(Title2)
	if err != nil {
		return err
	}
	//color.Blue("[LOG]:WriteTitle2 Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
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
func (doc *Report) WriteTitle3(text string) error {
	Title3 := fmt.Sprintf(XMLTitle3, text)
	_, err := doc.Doc.WriteString(Title3)
	if err != nil {
		return err
	}
	//color.Blue("[LOG]:WriteTitle3 Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

//WriteText == 正文的格式
func (doc *Report) WriteText(text string) error {
	Text := fmt.Sprintf(XMLText, text)
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
func (doc *Report) WriteTable(tableBody [][][]interface{}, tableHead [][]interface{}) error {
	XMLTable := bytes.Buffer{}
	XMLTable.WriteString(XMLTableHead)

	if tableHead != nil {
		XMLTable.WriteString(XMLTableTR)
		for _, rowdata := range tableHead {
			XMLTable.WriteString(XMLHeadTableTDBegin)
			for _, rowEle := range rowdata {
				data := fmt.Sprintf(XMLHeadtableTDText, rowEle)
				XMLTable.WriteString(data)
			}
			XMLTable.WriteString(XMLHeadTableTDEnd)
		}
		XMLTable.WriteString(XMLTableEndTR)
	}

	//Generate format
	for _, v := range tableBody {
		XMLTable.WriteString(XMLTableTR)

		for _, vv := range v {
			XMLTable.WriteString(XMLHeadTableTDBegin)
			for _ = range vv {
				XMLTable.WriteString(XMLHeadtableTDText)
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
			for _, rowEle := range rowdata {
				rows = append(rows, rowEle)
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
func (doc *Report) WriteImage(imagesData []*Image, withtext bool, text string) error {
	xmlimage := bytes.Buffer{}

	xmlimage.WriteString(XMLIMGTitle)
	for _, imagedata := range imagesData {
		imageSrc := imagedata.ImageSrc
		URIDist := imagedata.URIDist
		coordsizeX := imagedata.CoordsizeX
		coordsizeY := imagedata.CoordsizeY
		height := imagedata.Height
		width := imagedata.Width

		file, err := os.Open(imageSrc)
		if err != nil {
			return err
		}
		defer file.Close()
		//Get bindata , encode via Base64
		finfo, _ := file.Stat()
		size := finfo.Size()
		buf := make([]byte, size)
		encoder := bufio.NewReader(file)
		encoder.Read(buf)
		bindata := base64.StdEncoding.EncodeToString(buf)
		URI := "wordml://" + URIDist
		imageSec := fmt.Sprintf(XMLImage, URI, bindata, filepath.Base(imageSrc), strconv.FormatFloat(height, 'f', -1, 64),
			strconv.FormatFloat(width, 'f', -1, 64), strconv.Itoa(coordsizeY), strconv.Itoa(coordsizeX), URI, filepath.Base(imageSrc))
		_, err = xmlimage.WriteString(imageSec)
		if err != nil {
			return err
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
func (doc *Report) writeftr() error {

	_, err := doc.Doc.WriteString(XMLftr)
	if err != nil {
		return err
	}
	// color.Blue("[LOG]:WriteTitle1 Wrote" + strconv.FormatInt(int64(count), 10) + "bytes")
	return nil
}

// TODO: 判断是否是资源  是的话 引入  否  按字符串处理
func isResource(str string) bool {
	return true
}

//CloseReport close file handle
func (doc *Report) CloseReport() error {
	return doc.Doc.Close()
}
