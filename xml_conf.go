package report

const (

	//XMLHead ...
	XMLHead = `
  <?xml version="1.0" encoding="utf-8"?>
  <?mso-application progid="Word.Document"?>

  <w:wordDocument xmlns:aml="http://schemas.microsoft.com/aml/2001/core" xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:dt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml" xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wsp="http://schemas.microsoft.com/office/word/2003/wordml/sp2" xmlns:sl="http://schemas.microsoft.com/schemaLibrary/2003/core" w:macrosPresent="no" w:embeddedObjPresent="no" w:ocxPresent="no" xml:space="preserve">
	<w:ignoreSubtree w:val="http://schemas.microsoft.com/office/word/2003/wordml/sp2"/>
    <o:DocumentProperties>
      <o:Author>易焇</o:Author>
      <o:LastAuthor>scnace</o:LastAuthor>
      <o:Revision>4</o:Revision>
      <o:Created>2016-09-09T22:37:00Z</o:Created>
      <o:LastSaved>2016-09-09T15:47:51Z</o:LastSaved>
      <o:TotalTime>6</o:TotalTime>
      <o:Bytes>0</o:Bytes>
      <o:Pages>1</o:Pages>
      <o:Words>14</o:Words>
      <o:Characters>81</o:Characters>
      <o:Company>Microsoft</o:Company>
      <o:Lines>1</o:Lines>
      <o:Paragraphs>1</o:Paragraphs>
      <o:CharactersWithSpaces>94</o:CharactersWithSpaces>
    </o:DocumentProperties>
    <o:CustomDocumentProperties>
      <o:KSOProductBuildVer dt:dt="string">2052-10.1.0.5672</o:KSOProductBuildVer>
    </o:CustomDocumentProperties>
    <w:fonts>
      <w:defaultFonts w:ascii="Calibri" w:fareast="宋体" w:h-ansi="Calibri" w:cs="Times New Roman"/>
      <w:font w:name="Times New Roman">
        <w:altName w:val="DejaVu Sans"/>
        <w:panose-1 w:val="00000000000000000000"/>
        <w:charset w:val="00"/>
        <w:family w:val="Auto"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="00000000" w:usb-1="00000000" w:usb-2="00000000" w:usb-3="00000000" w:csb-0="00000000" w:csb-1="00000000"/>
      </w:font>
      <w:font w:name="宋体">
        <w:altName w:val="文泉驿微米黑"/>
        <w:panose-1 w:val="00000000000000000000"/>
        <w:charset w:val="86"/>
        <w:family w:val="Auto"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="00000000" w:usb-1="00000000" w:usb-2="00000000" w:usb-3="00000000" w:csb-0="00000000" w:csb-1="00000000"/>
      </w:font>
      <w:font w:name="DejaVu Sans">
        <w:panose-1 w:val="020B0603030804020204"/>
        <w:charset w:val="00"/>
        <w:family w:val="Roman"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="E7006EFF" w:usb-1="D200FDFF" w:usb-2="0A246029" w:usb-3="0400200C" w:csb-0="600001FF" w:csb-1="DFFF0000"/>
      </w:font>
      <w:font w:name="方正书宋_GBK">
        <w:altName w:val="文泉驿微米黑"/>
        <w:panose-1 w:val="02000000000000000000"/>
        <w:charset w:val="86"/>
        <w:family w:val="Auto"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="00000001" w:usb-1="08000000" w:usb-2="00000000" w:usb-3="00000000" w:csb-0="00040000" w:csb-1="00000000"/>
      </w:font>
      <w:font w:name="方正黑体_GBK">
        <w:altName w:val="文泉驿微米黑"/>
        <w:panose-1 w:val="02000000000000000000"/>
        <w:charset w:val="00"/>
        <w:family w:val="Auto"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="00000001" w:usb-1="08000000" w:usb-2="00000000" w:usb-3="00000000" w:csb-0="00040000" w:csb-1="00000000"/>
      </w:font>
      <w:font w:name="Cambria">
        <w:altName w:val="FreeSerif"/>
        <w:panose-1 w:val="02040503050406030204"/>
        <w:charset w:val="00"/>
        <w:family w:val="Modern"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="00000000" w:usb-1="00000000" w:usb-2="00000000" w:usb-3="00000000" w:csb-0="0000019F" w:csb-1="00000000"/>
      </w:font>
      <w:font w:name="Calibri">
        <w:altName w:val="DejaVu Sans"/>
        <w:panose-1 w:val="020F0502020204030204"/>
        <w:charset w:val="00"/>
        <w:family w:val="Decorative"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="00000000" w:usb-1="00000000" w:usb-2="00000001" w:usb-3="00000000" w:csb-0="0000019F" w:csb-1="00000000"/>
      </w:font>
      <w:font w:name="Cambria Math">
        <w:altName w:val="Kedage"/>
        <w:panose-1 w:val="00000000000000000000"/>
        <w:charset w:val="00"/>
        <w:family w:val="Auto"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="00000000" w:usb-1="00000000" w:usb-2="00000000" w:usb-3="00000000" w:csb-0="00000000" w:csb-1="00000000"/>
      </w:font>
      <w:font w:name="@宋体">
        <w:altName w:val="文泉驿微米黑"/>
        <w:panose-1 w:val="00000000000000000000"/>
        <w:charset w:val="00"/>
        <w:family w:val="Auto"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="00000003" w:usb-1="288F0000" w:usb-2="00000016" w:usb-3="00000000" w:csb-0="00040001" w:csb-1="00000000"/>
      </w:font>
      <w:font w:name="文泉驿微米黑">
        <w:panose-1 w:val="020B0606030804020204"/>
        <w:charset w:val="86"/>
        <w:family w:val="Auto"/>
        <w:pitch w:val="Default"/>
        <w:sig w:usb-0="E10002EF" w:usb-1="6BDFFCFB" w:usb-2="00800036" w:usb-3="00000000" w:csb-0="603E019F" w:csb-1="DFD70000"/>
      </w:font>
    </w:fonts>
    <w:styles>
      <w:latentStyles w:defLockedState="off" w:latentStyleCount="260">
        <w:lsdException w:name="Normal"/>
        <w:lsdException w:name="heading 1"/>
        <w:lsdException w:name="heading 2"/>
        <w:lsdException w:name="heading 3"/>
        <w:lsdException w:name="heading 4"/>
        <w:lsdException w:name="heading 5"/>
        <w:lsdException w:name="heading 6"/>
        <w:lsdException w:name="heading 7"/>
        <w:lsdException w:name="heading 8"/>
        <w:lsdException w:name="heading 9"/>
        <w:lsdException w:name="index 1"/>
        <w:lsdException w:name="index 2"/>
        <w:lsdException w:name="index 3"/>
        <w:lsdException w:name="index 4"/>
        <w:lsdException w:name="index 5"/>
        <w:lsdException w:name="index 6"/>
        <w:lsdException w:name="index 7"/>
        <w:lsdException w:name="index 8"/>
        <w:lsdException w:name="index 9"/>
        <w:lsdException w:name="toc 1"/>
        <w:lsdException w:name="toc 2"/>
        <w:lsdException w:name="toc 3"/>
        <w:lsdException w:name="toc 4"/>
        <w:lsdException w:name="toc 5"/>
        <w:lsdException w:name="toc 6"/>
        <w:lsdException w:name="toc 7"/>
        <w:lsdException w:name="toc 8"/>
        <w:lsdException w:name="toc 9"/>
        <w:lsdException w:name="Normal Indent"/>
        <w:lsdException w:name="footnote text"/>
        <w:lsdException w:name="annotation text"/>
        <w:lsdException w:name="header"/>
        <w:lsdException w:name="footer"/>
        <w:lsdException w:name="index heading"/>
        <w:lsdException w:name="caption"/>
        <w:lsdException w:name="table of figures"/>
        <w:lsdException w:name="envelope address"/>
        <w:lsdException w:name="envelope return"/>
        <w:lsdException w:name="footnote reference"/>
        <w:lsdException w:name="annotation reference"/>
        <w:lsdException w:name="line number"/>
        <w:lsdException w:name="page number"/>
        <w:lsdException w:name="endnote reference"/>
        <w:lsdException w:name="endnote text"/>
        <w:lsdException w:name="table of authorities"/>
        <w:lsdException w:name="macro"/>
        <w:lsdException w:name="toa heading"/>
        <w:lsdException w:name="List"/>
        <w:lsdException w:name="List Bullet"/>
        <w:lsdException w:name="List Number"/>
        <w:lsdException w:name="List 2"/>
        <w:lsdException w:name="List 3"/>
        <w:lsdException w:name="List 4"/>
        <w:lsdException w:name="List 5"/>
        <w:lsdException w:name="List Bullet 2"/>
        <w:lsdException w:name="List Bullet 3"/>
        <w:lsdException w:name="List Bullet 4"/>
        <w:lsdException w:name="List Bullet 5"/>
        <w:lsdException w:name="List Number 2"/>
        <w:lsdException w:name="List Number 3"/>
        <w:lsdException w:name="List Number 4"/>
        <w:lsdException w:name="List Number 5"/>
        <w:lsdException w:name="Title"/>
        <w:lsdException w:name="Closing"/>
        <w:lsdException w:name="Signature"/>
        <w:lsdException w:name="Default Paragraph Font"/>
        <w:lsdException w:name="Body Text"/>
        <w:lsdException w:name="Body Text Indent"/>
        <w:lsdException w:name="List Continue"/>
        <w:lsdException w:name="List Continue 2"/>
        <w:lsdException w:name="List Continue 3"/>
        <w:lsdException w:name="List Continue 4"/>
        <w:lsdException w:name="List Continue 5"/>
        <w:lsdException w:name="Message Header"/>
        <w:lsdException w:name="Subtitle"/>
        <w:lsdException w:name="Salutation"/>
        <w:lsdException w:name="Date"/>
        <w:lsdException w:name="Body Text First Indent"/>
        <w:lsdException w:name="Body Text First Indent 2"/>
        <w:lsdException w:name="Note Heading"/>
        <w:lsdException w:name="Body Text 2"/>
        <w:lsdException w:name="Body Text 3"/>
        <w:lsdException w:name="Body Text Indent 2"/>
        <w:lsdException w:name="Body Text Indent 3"/>
        <w:lsdException w:name="Block Text"/>
        <w:lsdException w:name="Hyperlink"/>
        <w:lsdException w:name="FollowedHyperlink"/>
        <w:lsdException w:name="Strong"/>
        <w:lsdException w:name="Emphasis"/>
        <w:lsdException w:name="Document Map"/>
        <w:lsdException w:name="Plain Text"/>
        <w:lsdException w:name="E-mail Signature"/>
        <w:lsdException w:name="Normal (Web)"/>
        <w:lsdException w:name="HTML Acronym"/>
        <w:lsdException w:name="HTML Address"/>
        <w:lsdException w:name="HTML Cite"/>
        <w:lsdException w:name="HTML Code"/>
        <w:lsdException w:name="HTML Definition"/>
        <w:lsdException w:name="HTML Keyboard"/>
        <w:lsdException w:name="HTML Preformatted"/>
        <w:lsdException w:name="HTML Sample"/>
        <w:lsdException w:name="HTML Typewriter"/>
        <w:lsdException w:name="HTML Variable"/>
        <w:lsdException w:name="Normal Table"/>
        <w:lsdException w:name="annotation subject"/>
        <w:lsdException w:name="Table Simple 1"/>
        <w:lsdException w:name="Table Simple 2"/>
        <w:lsdException w:name="Table Simple 3"/>
        <w:lsdException w:name="Table Classic 1"/>
        <w:lsdException w:name="Table Classic 2"/>
        <w:lsdException w:name="Table Classic 3"/>
        <w:lsdException w:name="Table Classic 4"/>
        <w:lsdException w:name="Table Colorful 1"/>
        <w:lsdException w:name="Table Colorful 2"/>
        <w:lsdException w:name="Table Colorful 3"/>
        <w:lsdException w:name="Table Columns 1"/>
        <w:lsdException w:name="Table Columns 2"/>
        <w:lsdException w:name="Table Columns 3"/>
        <w:lsdException w:name="Table Columns 4"/>
        <w:lsdException w:name="Table Columns 5"/>
        <w:lsdException w:name="Table Grid 1"/>
        <w:lsdException w:name="Table Grid 2"/>
        <w:lsdException w:name="Table Grid 3"/>
        <w:lsdException w:name="Table Grid 4"/>
        <w:lsdException w:name="Table Grid 5"/>
        <w:lsdException w:name="Table Grid 6"/>
        <w:lsdException w:name="Table Grid 7"/>
        <w:lsdException w:name="Table Grid 8"/>
        <w:lsdException w:name="Table List 1"/>
        <w:lsdException w:name="Table List 2"/>
        <w:lsdException w:name="Table List 3"/>
        <w:lsdException w:name="Table List 4"/>
        <w:lsdException w:name="Table List 5"/>
        <w:lsdException w:name="Table List 6"/>
        <w:lsdException w:name="Table List 7"/>
        <w:lsdException w:name="Table List 8"/>
        <w:lsdException w:name="Table 3D effects 1"/>
        <w:lsdException w:name="Table 3D effects 2"/>
        <w:lsdException w:name="Table 3D effects 3"/>
        <w:lsdException w:name="Table Contemporary"/>
        <w:lsdException w:name="Table Elegant"/>
        <w:lsdException w:name="Table Professional"/>
        <w:lsdException w:name="Table Subtle 1"/>
        <w:lsdException w:name="Table Subtle 2"/>
        <w:lsdException w:name="Table Web 1"/>
        <w:lsdException w:name="Table Web 2"/>
        <w:lsdException w:name="Table Web 3"/>
        <w:lsdException w:name="Balloon Text"/>
        <w:lsdException w:name="Table Grid"/>
        <w:lsdException w:name="Table Theme"/>
        <w:lsdException w:name="Light Shading"/>
        <w:lsdException w:name="Light List"/>
        <w:lsdException w:name="Light Grid"/>
        <w:lsdException w:name="Medium Shading 1"/>
        <w:lsdException w:name="Medium Shading 2"/>
        <w:lsdException w:name="Medium List 1"/>
        <w:lsdException w:name="Medium List 2"/>
        <w:lsdException w:name="Medium Grid 1"/>
        <w:lsdException w:name="Medium Grid 2"/>
        <w:lsdException w:name="Medium Grid 3"/>
        <w:lsdException w:name="Dark List"/>
        <w:lsdException w:name="Colorful Shading"/>
        <w:lsdException w:name="Colorful List"/>
        <w:lsdException w:name="Colorful Grid"/>
        <w:lsdException w:name="Light Shading Accent 1"/>
        <w:lsdException w:name="Light List Accent 1"/>
        <w:lsdException w:name="Light Grid Accent 1"/>
        <w:lsdException w:name="Medium Shading 1 Accent 1"/>
        <w:lsdException w:name="Medium Shading 2 Accent 1"/>
        <w:lsdException w:name="Medium List 1 Accent 1"/>
        <w:lsdException w:name="Medium List 2 Accent 1"/>
        <w:lsdException w:name="Medium Grid 1 Accent 1"/>
        <w:lsdException w:name="Medium Grid 2 Accent 1"/>
        <w:lsdException w:name="Medium Grid 3 Accent 1"/>
        <w:lsdException w:name="Dark List Accent 1"/>
        <w:lsdException w:name="Colorful Shading Accent 1"/>
        <w:lsdException w:name="Colorful List Accent 1"/>
        <w:lsdException w:name="Colorful Grid Accent 1"/>
        <w:lsdException w:name="Light Shading Accent 2"/>
        <w:lsdException w:name="Light List Accent 2"/>
        <w:lsdException w:name="Light Grid Accent 2"/>
        <w:lsdException w:name="Medium Shading 1 Accent 2"/>
        <w:lsdException w:name="Medium Shading 2 Accent 2"/>
        <w:lsdException w:name="Medium List 1 Accent 2"/>
        <w:lsdException w:name="Medium List 2 Accent 2"/>
        <w:lsdException w:name="Medium Grid 1 Accent 2"/>
        <w:lsdException w:name="Medium Grid 2 Accent 2"/>
        <w:lsdException w:name="Medium Grid 3 Accent 2"/>
        <w:lsdException w:name="Dark List Accent 2"/>
        <w:lsdException w:name="Colorful Shading Accent 2"/>
        <w:lsdException w:name="Colorful List Accent 2"/>
        <w:lsdException w:name="Colorful Grid Accent 2"/>
        <w:lsdException w:name="Light Shading Accent 3"/>
        <w:lsdException w:name="Light List Accent 3"/>
        <w:lsdException w:name="Light Grid Accent 3"/>
        <w:lsdException w:name="Medium Shading 1 Accent 3"/>
        <w:lsdException w:name="Medium Shading 2 Accent 3"/>
        <w:lsdException w:name="Medium List 1 Accent 3"/>
        <w:lsdException w:name="Medium List 2 Accent 3"/>
        <w:lsdException w:name="Medium Grid 1 Accent 3"/>
        <w:lsdException w:name="Medium Grid 2 Accent 3"/>
        <w:lsdException w:name="Medium Grid 3 Accent 3"/>
        <w:lsdException w:name="Dark List Accent 3"/>
        <w:lsdException w:name="Colorful Shading Accent 3"/>
        <w:lsdException w:name="Colorful List Accent 3"/>
        <w:lsdException w:name="Colorful Grid Accent 3"/>
        <w:lsdException w:name="Light Shading Accent 4"/>
        <w:lsdException w:name="Light List Accent 4"/>
        <w:lsdException w:name="Light Grid Accent 4"/>
        <w:lsdException w:name="Medium Shading 1 Accent 4"/>
        <w:lsdException w:name="Medium Shading 2 Accent 4"/>
        <w:lsdException w:name="Medium List 1 Accent 4"/>
        <w:lsdException w:name="Medium List 2 Accent 4"/>
        <w:lsdException w:name="Medium Grid 1 Accent 4"/>
        <w:lsdException w:name="Medium Grid 2 Accent 4"/>
        <w:lsdException w:name="Medium Grid 3 Accent 4"/>
        <w:lsdException w:name="Dark List Accent 4"/>
        <w:lsdException w:name="Colorful Shading Accent 4"/>
        <w:lsdException w:name="Colorful List Accent 4"/>
        <w:lsdException w:name="Colorful Grid Accent 4"/>
        <w:lsdException w:name="Light Shading Accent 5"/>
        <w:lsdException w:name="Light List Accent 5"/>
        <w:lsdException w:name="Light Grid Accent 5"/>
        <w:lsdException w:name="Medium Shading 1 Accent 5"/>
        <w:lsdException w:name="Medium Shading 2 Accent 5"/>
        <w:lsdException w:name="Medium List 1 Accent 5"/>
        <w:lsdException w:name="Medium List 2 Accent 5"/>
        <w:lsdException w:name="Medium Grid 1 Accent 5"/>
        <w:lsdException w:name="Medium Grid 2 Accent 5"/>
        <w:lsdException w:name="Medium Grid 3 Accent 5"/>
        <w:lsdException w:name="Dark List Accent 5"/>
        <w:lsdException w:name="Colorful Shading Accent 5"/>
        <w:lsdException w:name="Colorful List Accent 5"/>
        <w:lsdException w:name="Colorful Grid Accent 5"/>
        <w:lsdException w:name="Light Shading Accent 6"/>
        <w:lsdException w:name="Light List Accent 6"/>
        <w:lsdException w:name="Light Grid Accent 6"/>
        <w:lsdException w:name="Medium Shading 1 Accent 6"/>
        <w:lsdException w:name="Medium Shading 2 Accent 6"/>
        <w:lsdException w:name="Medium List 1 Accent 6"/>
        <w:lsdException w:name="Medium List 2 Accent 6"/>
        <w:lsdException w:name="Medium Grid 1 Accent 6"/>
        <w:lsdException w:name="Medium Grid 2 Accent 6"/>
        <w:lsdException w:name="Medium Grid 3 Accent 6"/>
        <w:lsdException w:name="Dark List Accent 6"/>
        <w:lsdException w:name="Colorful Shading Accent 6"/>
        <w:lsdException w:name="Colorful List Accent 6"/>
        <w:lsdException w:name="Colorful Grid Accent 6"/>
      </w:latentStyles>
      <w:style w:type="paragraph" w:styleId="a1" w:default="on">
        <w:name w:val="Normal"/>
        <w:pPr>
          <w:widowControl w:val="off"/>
          <w:jc w:val="both"/>
        </w:pPr>
        <w:rPr>
          <w:kern w:val="2"/>
          <w:sz w:val="21"/>
          <w:sz-cs w:val="22"/>
          <w:lang w:val="EN-US" w:fareast="ZH-CN"/>
        </w:rPr>
      </w:style>
      <w:style w:type="paragraph" w:styleId="a2">
        <w:name w:val="heading 1"/>
        <w:basedOn w:val="a1"/>
        <w:next w:val="a1"/>
        <w:pPr>
          <w:keepNext/>
          <w:keepLines/>
          <w:spacing w:before="340" w:before-lines="0" w:before-autospacing="off" w:after="330" w:after-autospacing="off" w:line="576" w:line-rule="auto"/>
          <w:outlineLvl w:val="0"/>
        </w:pPr>
        <w:rPr>
          <w:b/>
          <w:kern w:val="44"/>
          <w:sz w:val="44"/>
        </w:rPr>
      </w:style>
			<w:style w:type="paragraph" w:styleId="a3">
				<w:name w:val="heading 2"/>
				<w:basedOn w:val="a1"/>
				<w:next w:val="a1"/>
				<w:pPr>
					<w:keepNext/>
					<w:keepLines/>
					<w:spacing w:before="260" w:before-lines="0" w:before-autospacing="off" w:after="260" w:after-autospacing="off" w:line="413" w:line-rule="auto"/>
					<w:outlineLvl w:val="1"/>
				</w:pPr>
				<w:rPr>
					<w:rFonts w:ascii="DejaVu Sans" w:h-ansi="DejaVu Sans" w:fareast="方正黑体_GBK" w:hint="default"/>
					<w:b/>
					<w:sz w:val="32"/>
				</w:rPr>
			</w:style>
			<w:style w:type="paragraph" w:styleId="a4">
				<w:name w:val="heading 3"/>
				<w:basedOn w:val="a1"/>
				<w:next w:val="a1"/>
				<w:pPr>
					<w:keepNext/>
					<w:keepLines/>
					<w:spacing w:before="260" w:before-lines="0" w:before-autospacing="off" w:after="260" w:after-autospacing="off" w:line="413" w:line-rule="auto"/>
					<w:outlineLvl w:val="2"/>
				</w:pPr>
				<w:rPr>
					<w:b/>
					<w:sz w:val="32"/>
				</w:rPr>
			</w:style>
      <w:style w:type="character" w:styleId="a3" w:default="on">
        <w:name w:val="Default Paragraph Font"/>
        <w:semiHidden/>
      </w:style>
      <w:style w:type="table" w:styleId="a8" w:default="on">
        <w:name w:val="Normal Table"/>
        <w:semiHidden/>
        <w:rPr>
          <w:lang w:val="EN-US" w:fareast="ZH-CN"/>
        </w:rPr>
        <w:tblPr>
          <w:tblInd w:w="0" w:type="dxa"/>
          <w:tblCellMar>
            <w:top w:w="0" w:type="dxa"/>
            <w:left w:w="108" w:type="dxa"/>
            <w:bottom w:w="0" w:type="dxa"/>
            <w:right w:w="108" w:type="dxa"/>
          </w:tblCellMar>
        </w:tblPr>
      </w:style>
      <w:style w:type="table" w:styleId="a9">
        <w:name w:val="Table Grid"/>
        <w:basedOn w:val="a8"/>
        <w:pPr>
          <w:pStyle w:val="a8"/>
        </w:pPr>
        <w:rPr>
          <w:lang w:val="EN-US" w:fareast="ZH-CN"/>
        </w:rPr>
        <w:tblPr>
          <w:tblInd w:w="0" w:type="dxa"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="4" wx:bdrwidth="10" w:space="0" w:color="auto"/>
            <w:left w:val="single" w:sz="4" wx:bdrwidth="10" w:space="0" w:color="auto"/>
            <w:bottom w:val="single" w:sz="4" wx:bdrwidth="10" w:space="0" w:color="auto"/>
            <w:right w:val="single" w:sz="4" wx:bdrwidth="10" w:space="0" w:color="auto"/>
            <w:insideH w:val="single" w:sz="4" wx:bdrwidth="10" w:space="0" w:color="auto"/>
            <w:insideV w:val="single" w:sz="4" wx:bdrwidth="10" w:space="0" w:color="auto"/>
          </w:tblBorders>
          <w:tblCellMar>
            <w:top w:w="0" w:type="dxa"/>
            <w:left w:w="108" w:type="dxa"/>
            <w:bottom w:w="0" w:type="dxa"/>
            <w:right w:w="108" w:type="dxa"/>
          </w:tblCellMar>
        </w:tblPr>
      </w:style>
    </w:styles>
    <w:shapeDefaults>
      <o:shapedefaults fillcolor="#FFFFFF" fill="t" stroke="t">
        <v:fill on="t" focussize="0,0"/>
        <v:stroke color="#000000"/>
      </o:shapedefaults>
    </w:shapeDefaults>
    <w:docPr>
      <w:view w:val="print"/>
      <w:zoom w:percent="100"/>
      <w:characterSpacingControl w:val="CompressPunctuation"/>
      <w:documentProtection w:enforcement="off"/>
      <w:punctuationKerning/>
      <w:doNotEmbedSystemFonts/>
      <w:bordersDontSurroundHeader/>
      <w:bordersDontSurroundFooter/>
      <w:defaultTabStop w:val="420"/>
      <w:drawingGridVerticalSpacing w:val="156"/>
      <w:displayHorizontalDrawingGridEvery w:val="0"/>
      <w:displayVerticalDrawingGridEvery w:val="2"/>
      <w:compat>
        <w:adjustLineHeightInTable/>
        <w:doNotExpandShiftReturn/>
        <w:balanceSingleByteDoubleByteWidth/>
        <w:useFELayout/>
        <w:spaceForUL/>
        <w:wrapTextWithPunct/>
        <w:breakWrappedTables/>
        <w:useAsianBreakRules/>
        <w:dontGrowAutofit/>
        <w:useFELayout/>
      </w:compat>
    </w:docPr>
    <w:body>
      <wx:sect>
  `
	//XMLTitle == 居中大标题
	XMLTitle = `
	<w:p>
		<w:pPr>
			<w:pStyle w:val="a2"/>
			<w:jc w:val="center"/>
		</w:pPr>
		<w:r>
			<w:t>%s</w:t>
		</w:r>
	</w:p>
	`
	//XMLTitle1 == 标题1
	XMLTitle1 = `
  <w:p>
    <w:pPr>
      <w:pStyle w:val="a2"/>
    </w:pPr>
    <w:r>
      <w:t>%s</w:t>
    </w:r>
  </w:p>
  `
	//XMLTitle2 == 标题2
	XMLTitle2 = `
	<w:p>
    <w:pPr>
      <w:pStyle w:val="a3"/>
    </w:pPr>
    <w:r>
      <w:t>%s</w:t>
    </w:r>
  </w:p>
	`
	//XMLTitle2WithGrayBg == 灰色背景的标题2
	XMLTitle2WithGrayBg = `
	<w:p>
    <w:pPr>
      <w:pStyle w:val="a3"/>
			<w:shd w:val="clear" w:color="auto" w:fill="D4D8DA"/>
    </w:pPr>
    <w:r>
      <w:t>%s</w:t>
    </w:r>
  </w:p>
	`
	//XMLTitle3 == 标题3
	XMLTitle3 = `
	<w:p>
    <w:pPr>
      <w:pStyle w:val="a4"/>
    </w:pPr>
    <w:r>
      <w:t>%s</w:t>
    </w:r>
  </w:p>
	`
	//XMLText == 正文
	XMLText = `
	<w:p>
    <w:r>
      <w:t>%s</w:t>
    </w:r>
  </w:p>
	`
	//XMLInlineText == 不换行的正文
	XMLInlineText = `
	<w:pPr>
		<w:pStyle w:val="a2"/>
	</w:pPr>
	<w:r>
		<w:t>%s</w:t>
	</w:r>
	`
	//XMLTableHead ...
	XMLTableHead = `
		<w:tbl>
				<w:tblPr>
					<w:tblW w:w="9138" w:type="dxa"/>

					<w:tblBorders>
						<w:top w:val="thick-thin-medium-gap" w:sz="24" wx:bdrwidth="120" w:space="0" w:color="A5A5A5"/>
					</w:tblBorders>

				</w:tblPr>

        `
	//XMLTableTR ...
	XMLTableTR = `
	<w:tr wsp:rsidR="00AF5A68" wsp:rsidTr="00AF5A68">
`
	//XMLTableTD ...
	XMLTableTD = `
  <w:tc>
  <w:tcPr>
    <w:tcW w:w="3046" w:type="dxa"/>
    <w:shd w:val="clear" w:color="auto" w:fill="auto"/>
  </w:tcPr>
  <w:p wsp:rsidR="00AF5A68" wsp:rsidRDefault="00AF5A68" wsp:rsidP="00AF5A68">
    <w:pPr>
      <w:tabs>
        <w:tab w:val="center" w:pos="1312"/>
      </w:tabs>
    </w:pPr>
    <w:r>
      <w:t>%s</w:t>
    </w:r>
  </w:p>
</w:tc>
  `
	//XMLHeadTableTDBegin ...
	XMLHeadTableTDBegin = `
	<w:tc>
	<w:tcPr>
		<w:tcW w:w="3046" w:type="dxa"/>
		<w:shd w:val="clear" w:color="auto" w:fill="D4D8DA"/>
	</w:tcPr>
	<w:p wsp:rsidR="00AF5A68" wsp:rsidRDefault="00AF5A68" wsp:rsidP="00AF5A68">
		<w:pPr>
			<w:tabs>
				<w:tab w:val="center" w:pos="1312"/>
			</w:tabs>
		</w:pPr>
		`
	//XMLHeadtableTDText ..
	XMLHeadtableTDText = `
		<w:r>
			<w:t>%s</w:t>
		</w:r>
		`

	//XMLHeadTableTDEnd ...
	XMLHeadTableTDEnd = `
	</w:p>
</w:tc>
	`
	//XMLTableEndTR ...
	XMLTableEndTR = `
				</w:tr>
`
	//XMLTableFooter ...
	XMLTableFooter = `
  </w:tbl>
`
	//XMLSectBegin ...
	XMLSectBegin = `
      <w:sectPr>
`
	//XMLSectEnd ..
	XMLSectEnd = `
<w:pgSz w:w="11906" w:h="16838"/>
<w:pgMar w:top="1440" w:right="1800" w:bottom="1440" w:left="1800" w:header="851" w:footer="992" w:gutter="0"/>
<w:pgNumType/>
<w:cols w:space="425"/>
<w:docGrid w:type="lines" w:line-pitch="312"/>
</w:sectPr>
`
	//XMLhdr ==页眉
	XMLhdr = `
	<w:hdr w:type="odd">
		<w:p>
			<w:pPr>
				<w:pStyle w:val="a4"/>
				<w:tabs>
					<w:tab w:val="center" w:pos="4153"/>
					<w:tab w:val="center" w:pos="8306"/>
				</w:tabs>
				<w:jc w:val="center"/>
			</w:pPr>
			<w:r>
				<w:t>%s</w:t>
			</w:r>
		</w:p>
	</w:hdr>

`
	//XMLftr 加上页码
	XMLftr = `
<w:ftr w:type="odd">
	<w:p>
		<w:pPr>
			<w:pStyle w:val="a3"/>
			<w:tabs>
				<w:tab w:val="center" w:pos="4153"/>
				<w:tab w:val="right" w:pos="8306"/>
			</w:tabs>
		</w:pPr>
		<w:r>
			<w:rPr>
				<w:sz w:val="18"/>
			</w:rPr>
			<w:pict>
				<v:shape id="_x0000_s1026" o:spt="202" type="#_x0000_t202" style="position:absolute;left:0pt;margin-top:0pt;height:144pt;width:144pt;mso-position-horizontal:center;mso-position-horizontal-relative:margin;mso-wrap-style:none;z-index:251658240;mso-width-relative:page;mso-height-relative:page;" filled="f" stroked="f" coordsize="21600,21600">
					<v:path/>
					<v:fill on="f" focussize="0,0"/>
					<v:stroke on="f"/>
					<v:imagedata o:title=""/>
					<o:lock v:ext="edit" aspectratio="f"/>
					<v:textbox inset="0.00pt,0.00pt,0.00pt,0.00pt" style="mso-fit-shape-to-text:t;">
						<w:txbxContent>
							<w:p>
								<w:pPr>
									<w:snapToGrid w:val="off"/>
									<w:rPr>
										<w:sz w:val="18"/>
									</w:rPr>
								</w:pPr>
								<w:r>
									<w:rPr>
										<w:sz w:val="18"/>
									</w:rPr>
									<w:fldChar w:fldCharType="begin"/>
								</w:r>
								<w:r>
									<w:rPr>
										<w:sz w:val="18"/>
									</w:rPr>
									<w:instrText> PAGE  \* MERGEFORMAT </w:instrText>
								</w:r>
								<w:r>
									<w:rPr>
										<w:sz w:val="18"/>
									</w:rPr>
									<w:fldChar w:fldCharType="separate"/>
								</w:r>
								<w:r>
									<w:rPr>
										<w:sz w:val="18"/>
									</w:rPr>
									<w:t>1</w:t>
								</w:r>
								<w:r>
									<w:rPr>
										<w:sz w:val="18"/>
									</w:rPr>
									<w:fldChar w:fldCharType="end"/>
								</w:r>
							</w:p>
						</w:txbxContent>
					</v:textbox>
				</v:shape>
			</w:pict>
		</w:r>
	</w:p>
</w:ftr>
`
	//XMLIMGTitle ..
	XMLIMGTitle = `<w:p>`
	//XMLImage 图片XML格式
	XMLImage = `
	<w:r>
			<w:pict>
					<w:binData w:name="%s">%s</w:binData>
						<v:shape id="_x0000_s1026" o:spt="75" alt="%s" type="#_x0000_t75" style="height:%spt;width:%spt;"
						filled="f" o:preferrelative="t" stroked="f" coordsize="%s,%s">
							<v:fill on="f" focussize="0,0"/>
							<v:stroke on="f"/>
							<v:imagedata src="%s" o:title="%s"/>
							<o:lock v:ext="edit" aspectratio="t"/>
							<w10:wrap type="none"/>
							<w10:anchorlock/>
						</v:shape>
			</w:pict>
	</w:r>
`
	//XMLIMGtail ...
	XMLIMGtail = `</w:p>`
	//XMLBr == 换行
	XMLBr = `
      <w:p/>
`
	//XMLEndHead ...
	XMLEndHead = `

  		</wx:sect>
  	</w:body>
  </w:wordDocument>
  `
)
