# EXPORT FEATURE DIFFICULTY RANKING

## RANKED: EASIEST → HARDEST

### 1. CSV EXPORT ⭐ (EASIEST)
**Difficulty:** 1/10  
**Time:** 2-4 hours  
**Effort:** Trivial

**Why Easy:**
- Data already structured (M0 → M1 → launches)
- Flatten hierarchy to rows
- Use `csv` library (Python) or `papaparse` (JS)
- No layout/styling concerns
- Just data serialization

**Implementation:**
```python
# Backend endpoint
@app.route('/api/export-csv')
def export_csv():
    data = get_filtered_roadmap()
    rows = []
    for m0 in data:
        for m1 in m0['m1_initiatives']:
            for launch in m1['key_launches']:
                rows.append({
                    'M0': m0['m0_priority'],
                    'M1': m1['m1_name'],
                    'Key_Launch': launch['key_launch_name'],
                    'Start_Quarter': launch['updated_start_quarter'],
                    # ... all fields
                })
    return send_csv(rows, 'roadmap.csv')
```

**Challenges:**
- None (it's the source format anyway)

---

### 2. PNG EXPORT ⭐⭐ (EASY)
**Difficulty:** 3/10  
**Time:** 1-2 days  
**Effort:** Low

**Why Easy:**
- Use `html2canvas` (frontend) or `Puppeteer` (backend)
- Screenshot existing DOM
- No recreation of layout
- One-time render

**Implementation:**
```typescript
// Frontend with html2canvas
import html2canvas from 'html2canvas';

async function exportPNG() {
  const timeline = document.querySelector('.timeline');
  const canvas = await html2canvas(timeline, {
    scale: 2, // High DPI
    backgroundColor: '#ffffff'
  });
  const link = document.createElement('a');
  link.download = 'roadmap.png';
  link.href = canvas.toDataURL();
  link.click();
}
```

**Challenges:**
- **Viewport limitations:** Timeline wider than screen → need to scroll-capture or stitch
- **Quality:** Text/colors may look blurry if DPI not set right
- **Loading:** Must wait for all async content (tooltips hidden, badges loaded)
- **File size:** Large timelines = huge PNG files

**Solution:** Use Puppeteer server-side (headless Chrome) with viewport width = timeline width

---

### 3. PDF EXPORT ⭐⭐⭐ (MEDIUM)
**Difficulty:** 6/10  
**Time:** 3-5 days  
**Effort:** Medium

**Why Medium:**
- Multiple approaches, each with tradeoffs
- Must handle pagination (timeline spans multiple pages)
- Layout control required
- Need to render React components or reconstruct layout

**Approach 1: Puppeteer (Screenshot → PDF)**
```python
# Backend with Puppeteer
from pyppeteer import launch

async def export_pdf():
    browser = await launch()
    page = await browser.newPage()
    await page.goto('http://localhost:3000/timeline')
    await page.pdf({
        'path': 'roadmap.pdf',
        'format': 'A4',
        'landscape': True,
        'printBackground': True
    })
```
**Pros:** Preserves exact visual layout  
**Cons:** Slow (browser launch), pagination awkward, large file size

**Approach 2: jsPDF (Canvas → PDF)**
```typescript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

async function exportPDF() {
  const timeline = document.querySelector('.timeline');
  const canvas = await html2canvas(timeline);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
  pdf.save('roadmap.pdf');
}
```
**Pros:** Client-side, no server needed  
**Cons:** Single page only (or complex multi-page logic), rasterized (not vector text)

**Approach 3: PDFKit or ReportLab (Programmatic)**
```python
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas

def generate_pdf(roadmap_data):
    c = canvas.Canvas("roadmap.pdf", pagesize=landscape(letter))
    # Manually draw timeline grid, text, colors
    # Position each M1 row, quarter column, launch block
    c.save()
```
**Pros:** Vector output (scalable text), precise control, multi-page pagination  
**Cons:** Must recreate entire layout from scratch (grid, colors, text positioning)

**Challenges:**
- **Pagination:** Timeline doesn't fit on 1 page → split M1 rows across pages or shrink font
- **Styling:** CSS doesn't translate → must manually set colors, fonts, borders
- **Dynamic content:** Tooltips, filters won't work in static PDF
- **Performance:** Large datasets slow to render

**Recommended:** Puppeteer for quick MVP, ReportLab for production (better pagination)

---

### 4. POWERPOINT EXPORT ⭐⭐⭐⭐ (HARD)
**Difficulty:** 8/10  
**Time:** 1-2 weeks  
**Effort:** High

**Why Hard:**
- Must recreate layout with PowerPoint primitives (shapes, text boxes, tables)
- No DOM/CSS → manual positioning of every element
- PowerPoint object model is verbose and finicky
- Color mapping, font sizing, alignment all manual
- Multiple slides (pagination) requires logic to split data

**Implementation:**
```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN

def generate_pptx(roadmap_data):
    prs = Presentation()
    prs.slide_width = Inches(13.33)  # 16:9
    prs.slide_height = Inches(7.5)
    
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
    
    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(12), Inches(0.5))
    title_box.text = "eBay Roadmap - H2 2026"
    title_box.text_frame.paragraphs[0].font.size = Pt(28)
    
    # Timeline grid (manual positioning)
    row_height = Inches(0.8)
    col_width = Inches(2.5)
    
    # Headers: M1, Q1, Q2, Q3, Q4
    for col_idx, quarter in enumerate(['M1', 'Q1-2026', 'Q2-2026', 'Q3-2026', 'Q4-2026']):
        x = Inches(0.5 + col_idx * col_width)
        y = Inches(1.5)
        header = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE,
            x, y, col_width, row_height
        )
        header.fill.solid()
        header.fill.fore_color.rgb = RGBColor(91, 127, 255)  # Blue
        text_frame = header.text_frame
        text_frame.text = quarter
        text_frame.paragraphs[0].font.color.rgb = RGBColor(255, 255, 255)
        text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    
    # M1 rows
    for row_idx, m1 in enumerate(roadmap_data):
        y = Inches(1.5 + (row_idx + 1) * row_height)
        
        # M1 name cell
        m1_cell = slide.shapes.add_textbox(Inches(0.5), y, col_width, row_height)
        m1_cell.text = m1['m1_name']
        
        # Launch blocks in quarters
        for launch in m1['key_launches']:
            quarter_col = get_quarter_column(launch['updated_start_quarter'])
            x = Inches(0.5 + quarter_col * col_width)
            
            # Draw launch card
            launch_shape = slide.shapes.add_shape(
                MSO_SHAPE.ROUNDED_RECTANGLE,
                x + Inches(0.1), y + Inches(0.1),
                col_width - Inches(0.2), row_height - Inches(0.2)
            )
            launch_shape.fill.solid()
            launch_shape.fill.fore_color.rgb = get_geo_color(launch['geo_category'])
            launch_shape.text_frame.text = launch['key_launch_name']
            launch_shape.text_frame.paragraphs[0].font.size = Pt(9)
            
            # Red border if deferred
            if launch['roadmap_change'] == 'Deferred':
                launch_shape.line.color.rgb = RGBColor(255, 87, 87)
                launch_shape.line.width = Pt(2)
    
    prs.save('roadmap.pptx')
```

**Challenges:**
- **Manual positioning:** Every text box, shape, line requires X/Y coordinates in inches/points
- **Pagination:** If 50 M1 rows → need 5-10 slides, logic to split rows
- **Styling limitations:** PowerPoint shapes != CSS flexbox, must calculate positions manually
- **Data mapping:** Cross-priority badges → must create individual small shapes
- **Font/color matching:** Exact RGB values, font names may not exist in PowerPoint
- **Complex layouts:** Overlapping launches, multi-quarter launches (span columns) = geometry math
- **Testing:** Must open PowerPoint to verify, iterate slowly
- **No DOM inspection:** Can't "inspect element", must guess/calculate positions

**Why Jordan Needs It:**
- Executives live in PowerPoint
- Presents to leadership in slide decks
- Needs to edit/annotate slides (add speaker notes, change colors)
- Standard eBay format for roadmap reviews

**Alternatives:**
- **Google Slides API:** Similar complexity, requires OAuth
- **Export to PNG → Insert in PowerPoint:** Loses editability but much easier (see PNG above)

---

## SUMMARY TABLE

| Format     | Difficulty | Time      | Complexity                              | Editability | Quality      | Use Case                          |
|------------|------------|-----------|-----------------------------------------|-------------|--------------|-----------------------------------|
| **CSV**    | ⭐ 1/10    | 2-4 hours | Trivial (flatten data)                  | ✅ Excel     | Data only    | Analysts, data manipulation       |
| **PNG**    | ⭐⭐ 3/10   | 1-2 days  | Easy (screenshot DOM)                   | ❌ None      | Good         | Quick shares, Slack, email        |
| **PDF**    | ⭐⭐⭐ 6/10  | 3-5 days  | Medium (pagination, layout recreation)  | ❌ None      | High (vector)| Print, archive, formal reports    |
| **PPTX**   | ⭐⭐⭐⭐ 8/10 | 1-2 weeks | Hard (manual shape positioning, slides) | ✅ PowerPoint| Medium       | Executive presentations, editing  |

---

## RECOMMENDED MVP APPROACH

**Phase 1 (Week 2-3):** CSV Export
- Implement in 4 hours
- Covers 80% of data export needs
- Users can open in Excel, manipulate, create own charts

**Phase 2 (Week 4):** PNG Export (via html2canvas)
- Quick visual export for Slack/email
- No server dependency
- 1-day implementation

**Phase 3 (Month 2):** PDF Export (via Puppeteer)
- Server-side rendering
- Pagination logic
- Clean output for executives

**Phase 4 (Month 3+):** PowerPoint Export (via python-pptx)
- Only if Jordan explicitly requests
- Or use workaround: Export PNG → Insert into PowerPoint template (Jordan edits manually)
- Trade editability for development time

---

## WORKAROUND: POWERPOINT WITHOUT CODE

**Hybrid Approach:**
1. Export timeline as high-res PNG (html2canvas, scale=3)
2. Create PowerPoint template with eBay branding
3. Insert PNG as full-slide image
4. Add text boxes on top for annotations
5. Jordan edits text, adds speaker notes

**Pros:** 
- 10% of effort vs full PPTX generation
- Still editable (text overlays)
- Preserves exact visual layout

**Cons:**
- Launch blocks not individually editable (rasterized)
- Can't change colors/move launches

**Best for:** MVP where Jordan needs slides fast, can tolerate less editability

---

## FINAL RANKING (WITH CONTEXT)

**For Development Priority:**
1. **CSV** - Do first (Week 2, Day 9)
2. **PNG** - Do second (Week 3, Day 13)
3. **PDF** - Do if time permits (Week 4+)
4. **PPTX** - Only if Jordan demands or use PNG workaround

**For User Value:**
1. **PPTX** - Highest (exec presentations)
2. **PDF** - High (formal reports)
3. **CSV** - Medium (data analysts)
4. **PNG** - Medium (quick shares)

**For Implementation Ease:**
1. **CSV** - Easiest
2. **PNG** - Easy
3. **PDF** - Medium
4. **PPTX** - Hardest

**Ship CSV + PNG in Week 3. Defer PDF/PPTX post-launch unless Jordan blocks on it.**
