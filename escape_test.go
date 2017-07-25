package report

import (
	"strings"
	"testing"
)

func TestEscape(t *testing.T) {
	doc := NewDoc()
	doc.InitDoc("escape.doc")

	if err := doc.WriteHead(); err != nil {
		t.Errorf(err.Error())
	} else {
		t.Log("WriteHead Succeed")
	}

	if err := doc.WriteText(NewText(`~!@#$%^&*()_+-={}|[]\;':",./<>?`)); err != nil {
		t.Errorf(err.Error())
	} else {
		t.Log("TestWriteText succeed")
	}

	if err := doc.WriteEndHead(true, "pages", "Hello World", ""); err != nil {
		t.Errorf(err.Error())
	} else {
		t.Log("TestWriteEndHead Succeed")
	}

	doc.Doc.Close()
}

func TestEscapeCauseCrash(t *testing.T) {
	newText := func(words string) *Text {
		words = strings.Replace(words, "%", "&#37;", -1)
		text := &Text{}
		text.Words = words
		text.Color = "000000"
		text.Size = "19"
		text.Isbold = false
		text.IsCenter = false
		return text
	}

	doc := NewDoc()
	doc.InitDoc("escapeCauseCrash.doc")

	if err := doc.WriteHead(); err != nil {
		t.Errorf(err.Error())
	} else {
		t.Log("WriteHead Succeed")
	}

	if err := doc.WriteText(newText(`~!@#$%^&*()_+-={}|[]\;':",./<>?`)); err != nil {
		t.Errorf(err.Error())
	} else {
		t.Log("TestWriteText succeed")
	}

	if err := doc.WriteEndHead(true, "pages", "Hello World", ""); err != nil {
		t.Errorf(err.Error())
	} else {
		t.Log("TestWriteEndHead Succeed")
	}

	doc.Doc.Close()

}
