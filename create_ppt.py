import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image, ImageDraw, ImageFont

# -------------------------------------------------------------
# DIRECTORY & ASSET SETUP
# -------------------------------------------------------------
WORKSPACE_DIR = r"c:\Users\varsh\OneDrive\Desktop\quizwquake"
PPT_OUTPUT_PATH = os.path.join(WORKSPACE_DIR, "QuizQuake_Presentation.pptx")
ASSETS_DIR = os.path.join(WORKSPACE_DIR, "ppt_assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

USER_UPLOADED_DIR = r"C:\Users\varsh\.gemini\antigravity\brain\777067c2-91c3-4fe7-a517-91661b6ae225\.user_uploaded"

# Copy available screenshots
img_sources = [
    ("screen_setup_beige.jpg", os.path.join(USER_UPLOADED_DIR, "media_1795190767851_bbbe0232.jpg")),
    ("screen_cohort_chart.png", os.path.join(USER_UPLOADED_DIR, "media_1795190856014_7ef95224.png")),
    ("screen_setup_dark.png", os.path.join(USER_UPLOADED_DIR, "media_1795189871888_60768a2a.png")),
    ("screen_judge_dark.png", os.path.join(USER_UPLOADED_DIR, "media_1795189732361_df557393.png")),
]

copied_images = {}
for name, src in img_sources:
    if os.path.exists(src):
        dst = os.path.join(ASSETS_DIR, name)
        shutil.copyfile(src, dst)
        copied_images[name] = dst

# -------------------------------------------------------------
# PALETTE DEFINITION (Warm Beige & Brown Luxury Theme)
# -------------------------------------------------------------
BG_COLOR       = RGBColor(247, 244, 238)  # #F7F4EE Warm cream beige
CARD_BG        = RGBColor(255, 253, 249)  # #FFFDF9 Warm ivory
CARD_BORDER    = RGBColor(229, 215, 199)  # #E5D7C7 Soft sandstone
CARD_BORDER_HI = RGBColor(140, 88, 53)    # #8C5835 Cognac active border
WHITE_BG       = RGBColor(255, 255, 255)  # #FFFFFF Pure white for graphs

TEXT_PRIMARY   = RGBColor(37, 23, 16)     # #251710 Deep espresso
TEXT_SECONDARY = RGBColor(77, 56, 43)     # #4D382B Roasted coffee
TEXT_MUTED     = RGBColor(122, 100, 85)   # #7A6455 Warm taupe

ACCENT_BROWN   = RGBColor(123, 70, 34)    # #7B4622 Mocha brown
ACCENT_CARAMEL = RGBColor(196, 135, 76)   # #C4874C Caramel bronze
ACCENT_GREEN   = RGBColor(46, 125, 50)    # #2E7D32 Sage green
ACCENT_AMBER   = RGBColor(217, 119, 6)    # #D97706 Warm amber
ACCENT_RED     = RGBColor(220, 38, 38)    # #DC2626 Terracotta red

PILL_BG        = RGBColor(235, 221, 203)  # #EBDDCB Sand pill
PILL_TEXT      = RGBColor(99, 59, 29)     # #633B1D Espresso pill text

FONT_TITLE     = "Georgia"
FONT_BODY      = "Arial"

# -------------------------------------------------------------
# PRESENTATION INITIALIZATION
# -------------------------------------------------------------
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

def create_base_slide():
    slide = prs.slides.add_slide(blank_layout)
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_COLOR
    bg.line.fill.background()
    return slide

def add_header(slide, title_text, category_text="QUIZQUAKE: BRAINSTORM ARENA", subtitle_text=None, slide_num=None):
    # Top Tag Pill
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(4.5), Inches(0.35))
    pill.fill.solid()
    pill.fill.fore_color.rgb = PILL_BG
    pill.line.color.rgb = CARD_BORDER
    pill.line.width = Pt(1)
    tf_pill = pill.text_frame
    tf_pill.word_wrap = True
    tf_pill.margin_left = tf_pill.margin_right = tf_pill.margin_top = tf_pill.margin_bottom = 0
    p_pill = tf_pill.paragraphs[0]
    p_pill.text = f"⚡ {category_text.upper()}"
    p_pill.font.name = FONT_BODY
    p_pill.font.size = Pt(9.5)
    p_pill.font.bold = True
    p_pill.font.color.rgb = PILL_TEXT
    p_pill.alignment = PP_ALIGN.CENTER

    # Title Box
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
    tf = title_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = FONT_TITLE
    p.font.size = Pt(25)
    p.font.bold = True
    p.font.color.rgb = TEXT_PRIMARY

    # Subtitle if present
    if subtitle_text:
        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(0.4))
        tf_sub = sub_box.text_frame
        tf_sub.word_wrap = True
        tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
        p_sub = tf_sub.paragraphs[0]
        p_sub.text = subtitle_text
        p_sub.font.name = FONT_BODY
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = TEXT_MUTED

    # Footer
    add_footer(slide, slide_num)

def add_footer(slide, slide_num):
    # Thin divider
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.015))
    line.fill.solid()
    line.fill.fore_color.rgb = CARD_BORDER
    line.line.fill.background()

    footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(9.5), Inches(0.3))
    tf = footer_box.text_frame
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "QuizQuake: BrainStorm Arena • Computerized Adaptive Testing & Cognitive Diagnostics • Team Size: 3"
    p.font.name = FONT_BODY
    p.font.size = Pt(9.5)
    p.font.color.rgb = TEXT_MUTED

    if slide_num:
        num_box = slide.shapes.add_textbox(Inches(11.0), Inches(7.1), Inches(1.5), Inches(0.3))
        tf_num = num_box.text_frame
        tf_num.margin_left = tf_num.margin_top = tf_num.margin_right = tf_num.margin_bottom = 0
        p_num = tf_num.paragraphs[0]
        p_num.text = f"{slide_num:02d} / 16"
        p_num.font.name = FONT_BODY
        p_num.font.size = Pt(9.5)
        p_num.font.bold = True
        p_num.font.color.rgb = ACCENT_BROWN
        p_num.alignment = PP_ALIGN.RIGHT

def add_card(slide, left, top, width, height, bg=CARD_BG, border=CARD_BORDER, border_width=1):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg
    card.line.color.rgb = border
    card.line.width = Pt(border_width)
    return card

# -------------------------------------------------------------
# SLIDE 1: TITLE & COVER SLIDE
# -------------------------------------------------------------
s1 = create_base_slide()

# Hero Card Container
hero_card = add_card(s1, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.8), bg=CARD_BG, border=CARD_BORDER, border_width=1.5)

# Badge
hero_pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(1.3), Inches(4.8), Inches(0.4))
hero_pill.fill.solid()
hero_pill.fill.fore_color.rgb = PILL_BG
hero_pill.line.color.rgb = CARD_BORDER
p_hp = hero_pill.text_frame.paragraphs[0]
p_hp.text = "⚡ HACKATHON INNOVATION • COMPUTERIZED ADAPTIVE TESTING"
p_hp.font.name = FONT_BODY
p_hp.font.size = Pt(10)
p_hp.font.bold = True
p_hp.font.color.rgb = PILL_TEXT
p_hp.alignment = PP_ALIGN.CENTER

# Main Title
t_box = s1.shapes.add_textbox(Inches(1.3), Inches(1.9), Inches(10.5), Inches(1.5))
tf = t_box.text_frame
tf.word_wrap = True
p1 = tf.paragraphs[0]
p1.text = "QuizQuake: BrainStorm Arena"
p1.font.name = FONT_TITLE
p1.font.size = Pt(40)
p1.font.bold = True
p1.font.color.rgb = TEXT_PRIMARY

p2 = tf.add_paragraph()
p2.text = "Real-Time Difficulty Scaling & Heuristic IRT Cognitive Diagnostics"
p2.font.name = FONT_BODY
p2.font.size = Pt(17)
p2.font.bold = True
p2.font.color.rgb = ACCENT_BROWN
p2.space_before = Pt(8)

p3 = tf.add_paragraph()
p3.text = "Eliminating uniform testing fatigue by tailoring question challenge to candidate capability in real time and mapping conceptual weak spots on interactive diagnostic radar charts."
p3.font.name = FONT_BODY
p3.font.size = Pt(12)
p3.font.color.rgb = TEXT_SECONDARY
p3.space_before = Pt(12)

# 3 Bottom Meta Tiles
tiles_meta = [
    ("TEAM SPECIFICATION", "Team Size: 3 Members", "Algorithms, Fullstack & Diagnostics", ACCENT_BROWN),
    ("ASSESSMENT ENGINE", "3-Tier Dynamic IRT", "Easy ➔ Medium ➔ Hard Scaling", ACCENT_CARAMEL),
    ("DIAGNOSTIC TARGET", "64 Rigorous MCQs", "OS, Data Structures, Algos, Networks", ACCENT_GREEN)
]

for idx, (label, val, desc, color) in enumerate(tiles_meta):
    t_left = Inches(1.3 + idx * 3.65)
    tile = add_card(s1, t_left, Inches(4.6), Inches(3.4), Inches(1.6), bg=WHITE_BG, border=CARD_BORDER)
    tb = s1.shapes.add_textbox(t_left + Inches(0.2), Inches(4.75), Inches(3.0), Inches(1.3))
    ttf = tb.text_frame
    ttf.word_wrap = True
    tp1 = ttf.paragraphs[0]
    tp1.text = label
    tp1.font.name = FONT_BODY
    tp1.font.size = Pt(9)
    tp1.font.bold = True
    tp1.font.color.rgb = color
    
    tp2 = ttf.add_paragraph()
    tp2.text = val
    tp2.font.name = FONT_TITLE
    tp2.font.size = Pt(15)
    tp2.font.bold = True
    tp2.font.color.rgb = TEXT_PRIMARY
    tp2.space_before = Pt(4)

    tp3 = ttf.add_paragraph()
    tp3.text = desc
    tp3.font.name = FONT_BODY
    tp3.font.size = Pt(10)
    tp3.font.color.rgb = TEXT_MUTED
    tp3.space_before = Pt(4)

add_footer(s1, 1)

# -------------------------------------------------------------
# SLIDE 2: PROBLEM STATEMENT
# -------------------------------------------------------------
s2 = create_base_slide()
add_header(s2, "Problem Statement: The Uniform Testing Dilemma", "BACKGROUND & CHALLENGE", 
           "Traditional uniform testing subjects every student to static questionnaires, creating cognitive fatigue and uninformative scores.", 2)

cards_s2 = [
    ("Static Rigid Testing Fatigue", 
     "Conventional assessments give identical question sequences to candidates of vastly different proficiencies. Advanced engineers get bored with trivial questions, while novices get overwhelmed by insurmountable problems.",
     "Consequence: Disengagement, testing anxiety, and inability to discern true ceiling mastery.",
     ACCENT_RED),
    ("Binary Vanity Scores",
     "Standard portals return one aggregate score (e.g. '68%') with zero diagnostic granularity. Candidates never know if their 68% stems from syntax slips or fundamental conceptual voids.",
     "Consequence: Learners cannot take corrective action because root-cause deficits remain invisible.",
     ACCENT_AMBER),
    ("Zero Post-Test Remediation",
     "Most exam software ends abruptly at the results screen. Candidates are left without guidance on how to fix their weaknesses or close the specific knowledge gaps exposed during testing.",
     "Consequence: The exam measures failure instead of facilitating targeted learning and cognitive growth.",
     ACCENT_BROWN),
]

for idx, (title, body, consequence, col) in enumerate(cards_s2):
    c_left = Inches(0.8 + idx * 3.98)
    card = add_card(s2, c_left, Inches(2.0), Inches(3.78), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
    
    # Top color stripe
    stripe = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left + Inches(0.3), Inches(2.3), Inches(0.5), Inches(0.5))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = col
    stripe.line.fill.background()
    p_str = stripe.text_frame.paragraphs[0]
    p_str.text = str(idx + 1)
    p_str.font.name = FONT_BODY
    p_str.font.size = Pt(14)
    p_str.font.bold = True
    p_str.font.color.rgb = RGBColor(255, 255, 255)
    p_str.alignment = PP_ALIGN.CENTER

    tb = s2.shapes.add_textbox(c_left + Inches(0.3), Inches(3.0), Inches(3.18), Inches(3.6))
    ttf = tb.text_frame
    ttf.word_wrap = True
    
    p = ttf.paragraphs[0]
    p.text = title
    p.font.name = FONT_TITLE
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_PRIMARY

    p_b = ttf.add_paragraph()
    p_b.text = body
    p_b.font.name = FONT_BODY
    p_b.font.size = Pt(11)
    p_b.font.color.rgb = TEXT_SECONDARY
    p_b.space_before = Pt(8)

    p_c = ttf.add_paragraph()
    p_c.text = consequence
    p_c.font.name = FONT_BODY
    p_c.font.size = Pt(10.5)
    p_c.font.bold = True
    p_c.font.color.rgb = col
    p_c.space_before = Pt(12)

# -------------------------------------------------------------
# SLIDE 3: PURPOSE & VISION
# -------------------------------------------------------------
s3 = create_base_slide()
add_header(s3, "Purpose & Vision: Intelligent Adaptive Assessment", "PROJECT MISSION",
           "Democratizing computerized adaptive testing through real-time heuristic IRT scaling and root-cause deficit mapping.", 3)

# 2 Columns: Vision Manifesto (left) + 3 Core Pillars (right)
left_card = add_card(s3, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
tb_l = s3.shapes.add_textbox(Inches(1.1), Inches(2.3), Inches(5.0), Inches(4.2))
ttf_l = tb_l.text_frame
ttf_l.word_wrap = True

p_l1 = ttf_l.paragraphs[0]
p_l1.text = "THE QUIZQUAKE MISSION"
p_l1.font.name = FONT_BODY
p_l1.font.size = Pt(10)
p_l1.font.bold = True
p_l1.font.color.rgb = ACCENT_BROWN

p_l2 = ttf_l.add_paragraph()
p_l2.text = "Transforming exams from passive scorecards into active diagnostic engines."
p_l2.font.name = FONT_TITLE
p_l2.font.size = Pt(20)
p_l2.font.bold = True
p_l2.font.color.rgb = TEXT_PRIMARY
p_l2.space_before = Pt(6)

p_l3 = ttf_l.add_paragraph()
p_l3.text = "QuizQuake: BrainStorm Arena was engineered specifically to solve uniform testing fatigue. By tailoring question complexity on the fly to each learner's immediate performance, QuizQuake discovers their true capability envelope without cognitive burnout."
p_l3.font.name = FONT_BODY
p_l3.font.size = Pt(12)
p_l3.font.color.rgb = TEXT_SECONDARY
p_l3.space_before = Pt(12)

p_l4 = ttf_l.add_paragraph()
p_l4.text = "Upon completion, candidates receive an interactive radar chart mapping their mastery boundaries and a 1-click targeted remedial drill focusing exclusively on their identified weak subtopics."
p_l4.font.name = FONT_BODY
p_l4.font.size = Pt(12)
p_l4.font.color.rgb = TEXT_SECONDARY
p_l4.space_before = Pt(8)

# Right Pillars (3 stacked cards)
pillars = [
    ("Dynamic Real-Time Calibration", "Difficulty scales instantly across 3 tiers (Easy, Medium, Hard). Consecutive mastery unlocks higher stakes.", ACCENT_BROWN),
    ("Diagnostic Cognitive Radar", "Maps mastery across 4 disciplines against an explicit 60% Critical Deficit boundary to expose exact weaknesses.", ACCENT_CARAMEL),
    ("Closed-Loop Actionable Remediation", "Instantly generates 5-question focused drills with conceptual explanations to repair knowledge gaps on the spot.", ACCENT_GREEN),
]

for idx, (head, text, col) in enumerate(pillars):
    p_top = Inches(2.0 + idx * 1.65)
    p_card = add_card(s3, Inches(6.7), p_top, Inches(5.833), Inches(1.45), bg=WHITE_BG, border=CARD_BORDER)
    tb_r = s3.shapes.add_textbox(Inches(6.9), p_top + Inches(0.15), Inches(5.4), Inches(1.15))
    ttf_r = tb_r.text_frame
    ttf_r.word_wrap = True
    
    p = ttf_r.paragraphs[0]
    p.text = f"Pillar {idx+1}: {head}"
    p.font.name = FONT_TITLE
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = col

    p_sub = ttf_r.add_paragraph()
    p_sub.text = text
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(11)
    p_sub.font.color.rgb = TEXT_SECONDARY
    p_sub.space_before = Pt(4)

# -------------------------------------------------------------
# SLIDE 4: WHO WILL USE QUIZQUAKE? (TARGET AUDIENCE)
# -------------------------------------------------------------
s4 = create_base_slide()
add_header(s4, "Who Will Use QuizQuake? Stakeholder Ecosystem", "TARGET AUDIENCE & VALUE",
           "Designed for key educational and technical evaluation stakeholders across academia and engineering recruitment.", 4)

audiences = [
    ("Computer Science Students", 
     "Undergraduates and self-taught software engineers preparing for competitive technical interviews (GATE, FAANG, Campus Placements).",
     "• Experience personalized testing challenge\n• Eliminate uniform questionnaire boredom\n• Pinpoint exact weak topics like Deadlocks",
     ACCENT_BROWN),
    ("University Faculty & Tutors",
     "Computer Science professors and teaching assistants conducting continuous assessment and mid-term diagnostics.",
     "• Automatic identification of class deficits\n• Exportable diagnostic scorecard PDFs\n• Instant remedial assignment generation",
     ACCENT_CARAMEL),
    ("Technical Hiring Teams",
     "Recruiters and hiring managers screening engineering talent with rigorous, cheat-resistant adaptive assessments.",
     "• Accurately measures ceiling ability θ\n• Prevents brute-force memorization\n• Percentile benchmark against 1,500 peers",
     ACCENT_GREEN),
    ("Coding Bootcamps & Academies",
     "Accelerated engineering institutes requiring continuous progress tracking and targeted intervention drills.",
     "• Zero-latency offline client fallback\n• Real-time ability trend tracking\n• Seamless modular REST API architecture",
     RGBColor(140, 88, 53)),
]

for idx, (title, role, benefits, col) in enumerate(audiences):
    left = Inches(0.8 + idx * 2.98)
    card = add_card(s4, left, Inches(2.0), Inches(2.78), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s4.shapes.add_textbox(left + Inches(0.2), Inches(2.2), Inches(2.38), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.name = FONT_TITLE
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = col

    p_r = tf.add_paragraph()
    p_r.text = role
    p_r.font.name = FONT_BODY
    p_r.font.size = Pt(10.5)
    p_r.font.color.rgb = TEXT_SECONDARY
    p_r.space_before = Pt(6)

    p_div = tf.add_paragraph()
    p_div.text = "KEY VALUE DELIVERED:"
    p_div.font.name = FONT_BODY
    p_div.font.size = Pt(9)
    p_div.font.bold = True
    p_div.font.color.rgb = TEXT_MUTED
    p_div.space_before = Pt(12)

    p_b = tf.add_paragraph()
    p_b.text = benefits
    p_b.font.name = FONT_BODY
    p_b.font.size = Pt(10)
    p_b.font.color.rgb = TEXT_PRIMARY
    p_b.space_before = Pt(4)

# -------------------------------------------------------------
# SLIDE 5: CORE INNOVATION & DIFFERENTIATORS
# -------------------------------------------------------------
s5 = create_base_slide()
add_header(s5, "Core Innovation: Traditional Tests vs. QuizQuake", "KEY DIFFERENTIATORS",
           "Comparing conventional testing platforms against QuizQuake's computerized adaptive diagnostic model.", 5)

# Comparison Table
table_shape = s5.shapes.add_table(5, 3, Inches(0.8), Inches(2.0), Inches(11.733), Inches(4.6))
table = table_shape.table
table.columns[0].width = Inches(3.0)
table.columns[1].width = Inches(4.366)
table.columns[2].width = Inches(4.366)

headers = ["Evaluation Dimension", "Traditional Testing Platforms (Kahoot, Moodle, Quizlet)", "QuizQuake BrainStorm Arena"]
for col_idx, text in enumerate(headers):
    cell = table.cell(0, col_idx)
    cell.fill.solid()
    cell.fill.fore_color.rgb = PILL_BG if col_idx < 2 else ACCENT_BROWN
    p = cell.text_frame.paragraphs[0]
    p.text = text
    p.font.name = FONT_TITLE if col_idx == 2 else FONT_BODY
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255) if col_idx == 2 else PILL_TEXT
    p.alignment = PP_ALIGN.CENTER if col_idx > 0 else PP_ALIGN.LEFT

rows_data = [
    ("Question Difficulty", 
     "Static, predetermined order. All candidates answer identical questions regardless of proficiency.",
     "Dynamic 3-tier IRT scaling. Starts at Medium, escalates to Hard on consecutive wins, descends on errors."),
    ("Diagnostic Feedback", 
     "Binary percentage (e.g. 70%). Fails to identify which concepts caused mistakes.",
     "Interactive Weak-Topic Radar Chart displaying mastery boundaries against an explicit 60% Critical Deficit line."),
    ("Learning Remediation", 
     "None. Test terminates at the results screen; students must diagnose themselves.",
     "Automated 1-click Targeted Remedial Drill generator creating a 5-question drill targeting flagged subtopics."),
    ("System Reliability", 
     "Fails if the backend server experiences network dropouts or database disconnects.",
     "Dual-Engine Architecture: seamless offline client fallback mirrors full adaptive logic in the browser.")
]

for row_idx, (dim, trad, qq) in enumerate(rows_data):
    # Dim
    c0 = table.cell(row_idx + 1, 0)
    c0.fill.solid()
    c0.fill.fore_color.rgb = CARD_BG
    p0 = c0.text_frame.paragraphs[0]
    p0.text = dim
    p0.font.name = FONT_BODY
    p0.font.size = Pt(11)
    p0.font.bold = True
    p0.font.color.rgb = TEXT_PRIMARY

    # Trad
    c1 = table.cell(row_idx + 1, 1)
    c1.fill.solid()
    c1.fill.fore_color.rgb = WHITE_BG
    p1 = c1.text_frame.paragraphs[0]
    p1.text = trad
    p1.font.name = FONT_BODY
    p1.font.size = Pt(10.5)
    p1.font.color.rgb = TEXT_SECONDARY

    # QQ
    c2 = table.cell(row_idx + 1, 2)
    c2.fill.solid()
    c2.fill.fore_color.rgb = RGBColor(254, 250, 245)
    p2 = c2.text_frame.paragraphs[0]
    p2.text = qq
    p2.font.name = FONT_BODY
    p2.font.size = Pt(10.5)
    p2.font.bold = True
    p2.font.color.rgb = ACCENT_BROWN

# -------------------------------------------------------------
# SLIDE 6: COMPLETE FEATURE BREAKDOWN
# -------------------------------------------------------------
s6 = create_base_slide()
add_header(s6, "Complete Feature Breakdown: Core & Stretch Capabilities", "SYSTEM CAPABILITIES",
           "Architected to satisfy all hackathon core requirements plus stretch capabilities.", 6)

# 2 Big Cards: Core Must-Haves (Left) & Stretch Goals (Right)
core_card = add_card(s6, Inches(0.8), Inches(2.0), Inches(5.666), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
tb_core = s6.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(5.1), Inches(4.4))
tf_c = tb_core.text_frame
tf_c.word_wrap = True

p = tf_c.paragraphs[0]
p.text = "CORE CAPABILITIES (MUST-HAVE)"
p.font.name = FONT_BODY
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = ACCENT_BROWN

core_items = [
    ("Real-Time Difficulty Scaling", "Dynamic 3-tier IRT heuristic: starts at Medium; 2 consecutive correct escalate to Hard; 1 incorrect drops a tier."),
    ("Round-Robin Topic Rotation", "64 verified MCQs categorized across 4 domains. Round-robin topic selector prioritizes unvisited domains."),
    ("Synchronized Timer Engine", "Real-time countdown with urgency visual states (<60s warning, <20s critical) and automatic test submission."),
    ("Weak-Topic Radar Chart", "Responsive Chart.js radar chart mapping mastery percentages with an explicit 60% Critical Deficit boundary."),
    ("Deep Solution Review Breakdown", "Detailed rationale cards with question stem, candidate's choice, key answer, and core conceptual takeaways.")
]

for title, desc in core_items:
    pt = tf_c.add_paragraph()
    pt.text = f"✔ {title}: "
    pt.font.name = FONT_BODY
    pt.font.size = Pt(10.5)
    pt.font.bold = True
    pt.font.color.rgb = TEXT_PRIMARY
    pt.space_before = Pt(7)
    
    # append desc
    run = pt.add_run()
    run.text = desc
    run.font.bold = False
    run.font.color.rgb = TEXT_SECONDARY

stretch_card = add_card(s6, Inches(6.866), Inches(2.0), Inches(5.666), Inches(4.8), bg=WHITE_BG, border=CARD_BORDER)
tb_str = s6.shapes.add_textbox(Inches(7.15), Inches(2.2), Inches(5.1), Inches(4.4))
tf_s = tb_str.text_frame
tf_s.word_wrap = True

p_s = tf_s.paragraphs[0]
p_s.text = "ADVANCED STRETCH CAPABILITIES"
p_s.font.name = FONT_BODY
p_s.font.size = Pt(11)
p_s.font.bold = True
p_s.font.color.rgb = ACCENT_CARAMEL

stretch_items = [
    ("Targeted Remedial Quiz Generator", "One-click 5-question corrective drill focusing exclusively on flagged weak subtopics (e.g. Deadlock Avoidance)."),
    ("Cohort Percentile Benchmarking", "Gaussian statistical model comparing candidate accuracy against 1,500 test-takers (μ = 63%, σ = 14%)."),
    ("Gamified Streak Multipliers", "Score points calculator factoring difficulty tiers (Hard = 350 pts × streak bonus) and visual flame badges."),
    ("Historical Attempt Trajectory", "Persistent attempt logger saving records to server & localStorage with chronological accuracy trend lines."),
    ("1-Click PDF Scorecard Export", "Print-ready diagnostic report formatted for faculty review and parent-mentor feedback.")
]

for title, desc in stretch_items:
    pt = tf_s.add_paragraph()
    pt.text = f"★ {title}: "
    pt.font.name = FONT_BODY
    pt.font.size = Pt(10.5)
    pt.font.bold = True
    pt.font.color.rgb = ACCENT_BROWN
    pt.space_before = Pt(7)

    run = pt.add_run()
    run.text = desc
    run.font.bold = False
    run.font.color.rgb = TEXT_SECONDARY

# -------------------------------------------------------------
# SLIDE 7: TECHNICAL ARCHITECTURE & STACK
# -------------------------------------------------------------
s7 = create_base_slide()
add_header(s7, "Technical Architecture & System Design", "TECHNOLOGY STACK",
           "Modular full-stack TypeScript architecture with synchronized client-server adaptive logic.", 7)

tech_layers = [
    ("Frontend Presentation Layer", 
     "React 18 • TypeScript • Tailwind CSS • Vite",
     "• Interactive, accessible UI styled in warm beige & brown luxury theme\n• Chart.js & react-chartjs-2 for radar and cohort bar charts\n• SessionStorage state caching ensuring accidental refreshes never lose progress\n• Responsive layout optimized for mobile, tablet, and ultra-wide displays",
     ACCENT_BROWN),
    ("Backend API & Logic Layer",
     "Node.js • Express REST API • TypeScript",
     "• /api/quiz/start: Initializes session & selects balanced starting question\n• /api/quiz/next: Implements real-time heuristic tier scaling state machine\n• /api/quiz/finish: Computes IRT scaled theta, percentile, and weak topics\n• /api/remedial/generate: Creates custom 5-question corrective drills",
     ACCENT_CARAMEL),
    ("Data & Offline Fallback Layer",
     "JSON Datastore • Client Fallback Mirror",
     "• 64 verified, high-rigor Computer Science questions stored in structured JSON\n• Historical attempt logger maintaining up to 50 detailed evaluation records\n• Full client-side fallback engine (adaptiveClientEngine.ts) ensures zero downtime\n• Zero third-party cloud database dependencies; run locally with 1 command",
     ACCENT_GREEN)
]

for idx, (layer, stack, details, col) in enumerate(tech_layers):
    top = Inches(2.0 + idx * 1.62)
    card = add_card(s7, Inches(0.8), top, Inches(11.733), Inches(1.45), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s7.shapes.add_textbox(Inches(1.1), top + Inches(0.12), Inches(11.1), Inches(1.2))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = f"{layer} — {stack}"
    p.font.name = FONT_TITLE
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = col

    p_d = tf.add_paragraph()
    p_d.text = details
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(10.5)
    p_d.font.color.rgb = TEXT_SECONDARY
    p_d.space_before = Pt(4)

# -------------------------------------------------------------
# SLIDE 8: THE ADAPTIVE SCALING ENGINE STATE MACHINE
# -------------------------------------------------------------
s8 = create_base_slide()
add_header(s8, "Adaptive Scaling Engine: The 3-Tier IRT State Machine", "ALGORITHM MECHANICS",
           "Step-by-step heuristic tier escalation and descending logic based on candidate mastery.", 8)

# 3 Tiers Flow: Easy -> Medium -> Hard
tiers = [
    ("EASY TIER", "Foundational Knowledge", "Base Points: 100 pts",
     "• Basic definitions, terminology & core syntax\n• 2 consecutive correct answers elevate difficulty to Medium\n• 1 incorrect answer keeps candidate in Easy to reinforce basics",
     ACCENT_GREEN),
    ("MEDIUM TIER (STARTING STATE)", "Analytical Application", "Base Points: 200 pts",
     "• Default starting tier for all candidates upon test launch\n• 2 consecutive correct answers escalate candidate to HARD\n• 1 incorrect answer immediately descends candidate to EASY",
     ACCENT_AMBER),
    ("HARD TIER", "Complex Synthesis & Edge Cases", "Base Points: 350 pts",
     "• High-stakes complex scenarios (Deadlocks, DP memoization)\n• Sustained correct answers award 350 pts × streak bonus\n• 1 incorrect answer drops candidate back to MEDIUM",
     ACCENT_RED)
]

for idx, (tier_name, focus, pts, rules, col) in enumerate(tiers):
    left = Inches(0.8 + idx * 3.98)
    card = add_card(s8, left, Inches(2.0), Inches(3.78), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
    
    # Header box in card
    hb = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left + Inches(0.2), Inches(2.2), Inches(3.38), Inches(0.85))
    hb.fill.solid()
    hb.fill.fore_color.rgb = col
    hb.line.fill.background()
    p_h = hb.text_frame.paragraphs[0]
    p_h.text = tier_name
    p_h.font.name = FONT_BODY
    p_h.font.size = Pt(13)
    p_h.font.bold = True
    p_h.font.color.rgb = RGBColor(255, 255, 255)
    p_h.alignment = PP_ALIGN.CENTER

    p_f = hb.text_frame.add_paragraph()
    p_f.text = focus
    p_f.font.name = FONT_BODY
    p_f.font.size = Pt(10)
    p_f.font.color.rgb = RGBColor(255, 255, 255)
    p_f.alignment = PP_ALIGN.CENTER

    tb = s8.shapes.add_textbox(left + Inches(0.25), Inches(3.2), Inches(3.28), Inches(3.4))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = pts
    p.font.name = FONT_BODY
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = col

    p_r = tf.add_paragraph()
    p_r.text = rules
    p_r.font.name = FONT_BODY
    p_r.font.size = Pt(11)
    p_r.font.color.rgb = TEXT_SECONDARY
    p_r.space_before = Pt(8)

# -------------------------------------------------------------
# SLIDE 9: COMPUTER SCIENCE QUESTION TAXONOMY
# -------------------------------------------------------------
s9 = create_base_slide()
add_header(s9, "Computer Science Question Taxonomy (64 Verified MCQs)", "QUESTION REPOSITORY",
           "Curated by engineering educators across four foundational Computer Science domains.", 9)

domains_data = [
    ("Operating Systems (16 MCQs)", 
     "Process Scheduling (Preemptive vs Non-preemptive, Priority Inversion, MLFQ)\n"
     "Deadlock Avoidance (Banker's Algorithm, Resource Allocation Graphs, Safe States)\n"
     "Virtual Memory (Paging, TLB Misses, Page Fault Frequency, Thrashing, Inverted Page Tables)\n"
     "Concurrency (Semaphores, Mutexes, Producer-Consumer, Monitors)",
     ACCENT_BROWN),
    ("Data Structures (16 MCQs)",
     "Balanced Trees (AVL Rotations, Red-Black Tree Invariants, B+ Trees)\n"
     "Heaps & Priority Queues (Binary Heaps, Heapify Complexity, Median Maintenance)\n"
     "Hash Tables (Open Addressing vs Chaining, Universal Hashing, Load Factor Thresholds)\n"
     "Graphs (Adjacency Matrix vs List, Topological Sort, Disjoint Set Union)",
     ACCENT_CARAMEL),
    ("Algorithms (16 MCQs)",
     "Dynamic Programming (0/1 Knapsack, Longest Common Subsequence, Matrix Chain)\n"
     "Greedy Paradigm (Huffman Coding, Interval Scheduling, Kruskal vs Prim)\n"
     "Shortest Paths (Dijkstra Non-negative Invariants, Bellman-Ford Negative Cycles)\n"
     "Divide & Conquer (Master Theorem, Quickselect Average vs Worst Case)",
     ACCENT_GREEN),
    ("Computer Networks (16 MCQs)",
     "Transport Layer (TCP 3-Way Handshake, TIME_WAIT State, Silly Window Syndrome)\n"
     "Congestion Control (Slow Start, Congestion Avoidance, Fast Retransmit / Fast Recovery)\n"
     "Network & Routing (Subnetting CIDR, OSPF Link-State vs BGP Path-Vector)\n"
     "Application Layer (HTTP/2 Multiplexing, QUIC UDP Migration, DNS Hierarchy)",
     RGBColor(140, 88, 53))
]

for idx, (dom, topics, col) in enumerate(domains_data):
    row = idx // 2
    c_col = idx % 2
    left = Inches(0.8 + c_col * 5.96)
    top = Inches(2.0 + row * 2.45)
    
    card = add_card(s9, left, top, Inches(5.766), Inches(2.3), bg=CARD_BG, border=CARD_BORDER)
    tb = s9.shapes.add_textbox(left + Inches(0.25), top + Inches(0.18), Inches(5.26), Inches(1.95))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = dom
    p.font.name = FONT_TITLE
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = col

    p_t = tf.add_paragraph()
    p_t.text = topics
    p_t.font.name = FONT_BODY
    p_t.font.size = Pt(10)
    p_t.font.color.rgb = TEXT_SECONDARY
    p_t.space_before = Pt(6)

# -------------------------------------------------------------
# SLIDE 10: COGNITIVE DIAGNOSTICS & IRT SCORING
# -------------------------------------------------------------
s10 = create_base_slide()
add_header(s10, "Cognitive Diagnostics & IRT Scoring Methodology", "MATHEMATICAL MODELING",
           "Item Response Theory (IRT) scaled ability calculation and heuristic deficiency detection.", 10)

cards_s10 = [
    ("IRT Latent Ability (θ)",
     "Measures candidate ability on a standard normal continuum from -3.0 to +3.0 based on difficulty parameters:\n\n"
     "• Easy correct: +0.25 θ\n• Medium correct: +0.45 θ\n• Hard correct: +0.80 θ\n• Penalty on error weighted by tier difficulty\n\n"
     "Mapped directly to a human-readable 0-100 Scaled Ability score.",
     ACCENT_BROWN),
    ("The 60% Deficit Threshold",
     "Unlike blunt pass/fail exams, QuizQuake clusters answers by micro-subtopic (e.g., 'Deadlock Avoidance').\n\n"
     "• Accuracy >= 90%: Mastered\n• Accuracy 75-89%: Proficient\n• Accuracy 50-74%: Needs Improvement\n• Accuracy < 60%: Flagged as Critical Deficit\n\n"
     "Instantly highlighted in crimson on the Weak-Topic Radar Chart.",
     ACCENT_RED),
    ("Cohort Gaussian Benchmarking",
     "Every attempt is benchmarked against a calibrated engineering cohort of 1,500 test takers:\n\n"
     "• Mean (μ) = 63%\n• Standard Deviation (σ) = 14%\n• Percentile formula: Z = (X - μ) / σ\n• Top 10% Cutoff: 85% accuracy\n\n"
     "Provides authentic industry calibration for talent evaluation.",
     ACCENT_GREEN),
]

for idx, (title, body, col) in enumerate(cards_s10):
    left = Inches(0.8 + idx * 3.98)
    card = add_card(s10, left, Inches(2.0), Inches(3.78), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
    tb = s10.shapes.add_textbox(left + Inches(0.25), Inches(2.2), Inches(3.28), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.name = FONT_TITLE
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = col

    p_b = tf.add_paragraph()
    p_b.text = body
    p_b.font.name = FONT_BODY
    p_b.font.size = Pt(11)
    p_b.font.color.rgb = TEXT_SECONDARY
    p_b.space_before = Pt(8)

# -------------------------------------------------------------
# SLIDE 11: ALL WEBSITE SCREENS & LIVE UI SHOWCASE (REQUESTED)
# -------------------------------------------------------------
s11 = create_base_slide()
add_header(s11, "All Website Screens & Live UI Showcase", "INTERFACE GALLERY",
           "Complete visual walkthrough of QuizQuake's responsive beige & brown user interface.", 11)

# Gallery layout: 3 user uploaded images + 1 visual summary card
gallery_items = [
    ("Setup & Assessment Mode", copied_images.get("screen_setup_beige.jpg"), 
     "Interactive setup prompt with 5/10/20/Custom questions, 5/10/20/Untimed timers, and redesigned Assessment Mode."),
    ("Cohort Percentile Benchmark", copied_images.get("screen_cohort_chart.png"),
     "Pure white background graph benchmarking student performance against 1,500 peers with distribution bands."),
    ("Dark Mode Predecessor & Evolution", copied_images.get("screen_setup_dark.png"),
     "Initial prototype before user-guided transformation into luxury warm beige & brown design system."),
]

# 3 columns for screenshots
for idx, (label, img_path, caption) in enumerate(gallery_items):
    left = Inches(0.8 + idx * 3.98)
    card = add_card(s11, left, Inches(2.0), Inches(3.78), Inches(4.8), bg=WHITE_BG, border=CARD_BORDER)
    
    # Title
    tb_t = s11.shapes.add_textbox(left + Inches(0.15), Inches(2.1), Inches(3.48), Inches(0.4))
    tf_t = tb_t.text_frame
    tf_t.margin_left = tf_t.margin_top = 0
    p = tf_t.paragraphs[0]
    p.text = f"Screen {idx+1}: {label}"
    p.font.name = FONT_BODY
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BROWN

    # Image if exists
    if img_path and os.path.exists(img_path):
        try:
            s11.shapes.add_picture(img_path, left + Inches(0.15), Inches(2.55), width=Inches(3.48), height=Inches(2.5))
        except Exception as e:
            print(f"Error loading {img_path}: {e}")
    else:
        # Fallback card
        ph = add_card(s11, left + Inches(0.15), Inches(2.55), Inches(3.48), Inches(2.5), bg=CARD_BG, border=CARD_BORDER)
        p_ph = ph.text_frame.paragraphs[0]
        p_ph.text = "[Live Web View: " + label + "]"
        p_ph.font.size = Pt(10)
        p_ph.font.color.rgb = TEXT_MUTED
        p_ph.alignment = PP_ALIGN.CENTER

    # Caption
    tb_c = s11.shapes.add_textbox(left + Inches(0.15), Inches(5.15), Inches(3.48), Inches(1.5))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    tf_c.margin_left = tf_c.margin_top = 0
    p_c = tf_c.paragraphs[0]
    p_c.text = caption
    p_c.font.name = FONT_BODY
    p_c.font.size = Pt(10)
    p_c.font.color.rgb = TEXT_SECONDARY

# -------------------------------------------------------------
# SLIDE 12: WEAK-TOPIC RADAR & REMEDIAL DRILLS
# -------------------------------------------------------------
s12 = create_base_slide()
add_header(s12, "Interactive Weak-Topic Radar & Remedial Drills", "COGNITIVE REMEDIATION",
           "Turning diagnostic assessment into immediate corrective learning with zero faculty overhead.", 12)

# Left: Radar details; Right: Remedial Drill details
c12_l = add_card(s12, Inches(0.8), Inches(2.0), Inches(5.666), Inches(4.8), bg=WHITE_BG, border=CARD_BORDER)
tb_l = s12.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(5.1), Inches(4.4))
tf = tb_l.text_frame
tf.word_wrap = True

p = tf.paragraphs[0]
p.text = "WEAK-TOPIC RADAR CHART"
p.font.name = FONT_BODY
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = ACCENT_BROWN

radar_bullets = [
    "Multi-Domain Polygon Overlay: Simultaneously visualizes performance across Operating Systems, Data Structures, Algorithms, and Networks.",
    "Critical Deficit Boundary (60%): Explicit dashed boundary line immediately shows which domain areas fall beneath acceptable competence.",
    "Subtopic Pinpointing: Drills down into granular failure points (e.g. flagging 'Deadlock Avoidance' while candidate excels at 'Process Scheduling').",
    "Clean White Graph Canvas: Rendered on a pure white background with warm sandstone grid lines and deep espresso labels for crisp legibility."
]

for b in radar_bullets:
    pt = tf.add_paragraph()
    pt.text = "• " + b
    pt.font.name = FONT_BODY
    pt.font.size = Pt(11)
    pt.font.color.rgb = TEXT_SECONDARY
    pt.space_before = Pt(8)

c12_r = add_card(s12, Inches(6.866), Inches(2.0), Inches(5.666), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
tb_r = s12.shapes.add_textbox(Inches(7.15), Inches(2.2), Inches(5.1), Inches(4.4))
tf_r = tb_r.text_frame
tf_r.word_wrap = True

p = tf_r.paragraphs[0]
p.text = "AUTOMATED REMEDIAL DRILL ENGINE"
p.font.name = FONT_BODY
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = ACCENT_CARAMEL

remedial_bullets = [
    "1-Click Drill Generation: Evaluates flagged weak topics and synthesizes an interactive 5-question corrective drill in milliseconds.",
    "Zero Wait Time: Candidates can immediately test their corrected understanding without searching for remedial problem sets.",
    "Instant Rationale Feedback: Each answer selection triggers comprehensive conceptual takeaways and underlying algorithmic logic.",
    "Retest & Improvement Validation: Successfully answering remedial questions updates student records and reinforces conceptual invariants."
]

for b in remedial_bullets:
    pt = tf_r.add_paragraph()
    pt.text = "★ " + b
    pt.font.name = FONT_BODY
    pt.font.size = Pt(11)
    pt.font.color.rgb = TEXT_SECONDARY
    pt.space_before = Pt(8)

# -------------------------------------------------------------
# SLIDE 13: COHORT PERCENTILE & GAMIFICATION
# -------------------------------------------------------------
s13 = create_base_slide()
add_header(s13, "Cohort Benchmarking & Gamification Multiplier", "ENGAGEMENT & PEER BENCHMARK",
           "Motivating candidate excellence with statistical percentile ranks, streak bonuses, and badges.", 13)

cards_s13 = [
    ("Gaussian Percentile Ranking", 
     "Candidates are benchmarked against 1,500 standardized attempts:\n\n"
     "• Bell curve score distribution bands (0-20%, 21-40%, 41-60%, 61-80%, 81-100%)\n"
     "• Highlighted user band in rich chestnut brown\n"
     "• Real-time percentile calculation (e.g., '88th Percentile')\n"
     "• Batch median comparison (63%) & Top 10% threshold (85%)",
     ACCENT_BROWN),
    ("Dynamic Streak Multipliers", 
     "Encourages accuracy and deep concentration:\n\n"
     "• Streak points multiplier formula: 1 + (streak × tier bonus)\n"
     "• Hard tier questions grant 30% bonus per streak increment\n"
     "• Medium tier questions grant 15% bonus per streak increment\n"
     "• Animated streak flame triggers upon 3+ consecutive correct answers",
     ACCENT_AMBER),
    ("Unlockable Achievement Badges", 
     "Celebrates milestone achievements:\n\n"
     "• 'Deadlock Breaker': Mastering Hard-tier Concurrency & Deadlocks\n"
     "• 'Algorithmic Virtuoso': Achieving 100% in Dynamic Programming\n"
     "• 'Tier Ascendant': Escalating to Hard in under 3 minutes\n"
     "• Displayed prominently on the final faculty diagnostic scorecard",
     ACCENT_GREEN),
]

for idx, (title, body, col) in enumerate(cards_s13):
    left = Inches(0.8 + idx * 3.98)
    card = add_card(s13, left, Inches(2.0), Inches(3.78), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
    tb = s13.shapes.add_textbox(left + Inches(0.25), Inches(2.2), Inches(3.28), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = title
    p.font.name = FONT_TITLE
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = col

    p_b = tf.add_paragraph()
    p_b.text = body
    p_b.font.name = FONT_BODY
    p_b.font.size = Pt(11)
    p_b.font.color.rgb = TEXT_SECONDARY
    p_b.space_before = Pt(8)

# -------------------------------------------------------------
# SLIDE 14: PROJECT TEAM ROLES & COLLABORATION (TEAM SIZE: 3)
# -------------------------------------------------------------
s14 = create_base_slide()
add_header(s14, "Project Team Roles & Collaborative Ownership", "TEAM STRUCTURE (3 MEMBERS)",
           "Clear ownership division enabling rapid fullstack development and algorithm verification.", 14)

team_members = [
    ("Member 1 — Algorithms Lead",
     "Adaptive IRT Scaling & Engine Architect",
     "• Designed the 3-tier IRT heuristic state machine (Medium ➔ Hard ➔ Medium ➔ Easy)\n"
     "• Formulated the latent ability theta score and streak multiplier equations\n"
     "• Built the automated algorithm verification test suite (test-adaptive.ts)\n"
     "• Authored the 64-item Computer Science taxonomy and difficulty rubrics",
     ACCENT_BROWN),
    ("Member 2 — Fullstack Architect",
     "UI/UX Design System & Frontend Lead",
     "• Architected the React 18 + Vite frontend with Tailwind CSS\n"
     "• Designed the luxury beige and brown aesthetic design system\n"
     "• Engineered the synchronized TimerEngine with untimed stopwatch mode\n"
     "• Integrated Chart.js Radar and Cohort Bar graphs with pure white backgrounds",
     ACCENT_CARAMEL),
    ("Member 3 — Backend Engineer",
     "API Services & Cognitive Diagnostics Lead",
     "• Engineered the Express REST API backend and session lifecycle controllers\n"
     "• Developed the weak-topic heuristic diagnostic calculation engine\n"
     "• Built the 1-click targeted remedial drill generator\n"
     "• Implemented the persistent attempt history logger and JSON datastore",
     ACCENT_GREEN),
]

for idx, (name, role, contributions, col) in enumerate(team_members):
    left = Inches(0.8 + idx * 3.98)
    card = add_card(s14, left, Inches(2.0), Inches(3.78), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
    
    # Avatar Circle
    avatar = s14.shapes.add_shape(MSO_SHAPE.OVAL, left + Inches(0.3), Inches(2.3), Inches(0.8), Inches(0.8))
    avatar.fill.solid()
    avatar.fill.fore_color.rgb = col
    avatar.line.fill.background()
    p_av = avatar.text_frame.paragraphs[0]
    p_av.text = f"M{idx+1}"
    p_av.font.name = FONT_BODY
    p_av.font.size = Pt(14)
    p_av.font.bold = True
    p_av.font.color.rgb = RGBColor(255, 255, 255)
    p_av.alignment = PP_ALIGN.CENTER

    tb = s14.shapes.add_textbox(left + Inches(0.25), Inches(3.25), Inches(3.28), Inches(3.3))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = name
    p.font.name = FONT_TITLE
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_PRIMARY

    p_r = tf.add_paragraph()
    p_r.text = role
    p_r.font.name = FONT_BODY
    p_r.font.size = Pt(11)
    p_r.font.bold = True
    p_r.font.color.rgb = col
    p_r.space_before = Pt(3)

    p_c = tf.add_paragraph()
    p_c.text = contributions
    p_c.font.name = FONT_BODY
    p_c.font.size = Pt(10)
    p_c.font.color.rgb = TEXT_SECONDARY
    p_c.space_before = Pt(8)

# -------------------------------------------------------------
# SLIDE 15: QUALITY ASSURANCE & AUTOMATED TESTING
# -------------------------------------------------------------
s15 = create_base_slide()
add_header(s15, "Quality Assurance: Verification & Test Automation", "VERIFICATION SUITE",
           "Automated end-to-end verification proving adaptive difficulty escalation and topic diagnosis.", 15)

tests_data = [
    ("Test 1: Question Bank Integrity", "PASSED (64 MCQs)", "Verifies that the repository contains over 60 high-rigor, verified Computer Science items with complete taxonomical distribution.", ACCENT_GREEN),
    ("Test 2: Difficulty Tier Escalation", "PASSED (Medium ➔ Hard)", "Verifies that 2 consecutive correct answers on Medium automatically escalate the candidate to Hard tier difficulty.", ACCENT_GREEN),
    ("Test 3: Difficulty Descent Logic", "PASSED (Hard ➔ Med ➔ Easy)", "Verifies that an incorrect answer on Hard immediately drops difficulty to Medium, and an incorrect on Medium drops to Easy.", ACCENT_GREEN),
    ("Test 4: Exact Brief Demo Scenario", "PASSED (Deadlocks Flagged)", "Executes the exact scenario: Start OS ➔ 2 Medium Correct ➔ Escalate Hard ➔ 1 Incorrect ➔ Flags 'Deadlock Avoidance' on Radar.", ACCENT_GREEN),
    ("Test 5: Remedial Drill Generation", "PASSED (5 Targeted Items)", "Confirms that the remedial engine synthesizes an interactive 5-question drill targeting candidate's flagged weak subtopics.", ACCENT_GREEN),
    ("Test 6: Production Build Optimization", "PASSED (Vite + TypeScript)", "Complete production bundle compiled with 0 TypeScript errors and optimized bundle size (<155 kB gzip).", ACCENT_GREEN),
]

for idx, (t_name, status, desc, col) in enumerate(tests_data):
    row = idx // 2
    c_col = idx % 2
    left = Inches(0.8 + c_col * 5.96)
    top = Inches(2.0 + row * 1.62)
    
    card = add_card(s15, left, top, Inches(5.766), Inches(1.45), bg=WHITE_BG, border=CARD_BORDER)
    tb = s15.shapes.add_textbox(left + Inches(0.2), top + Inches(0.12), Inches(5.36), Inches(1.2))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = t_name + " — "
    p.font.name = FONT_BODY
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEXT_PRIMARY
    
    run = p.add_run()
    run.text = f"[{status}]"
    run.font.color.rgb = col
    run.font.bold = True

    p_d = tf.add_paragraph()
    p_d.text = desc
    p_d.font.name = FONT_BODY
    p_d.font.size = Pt(10)
    p_d.font.color.rgb = TEXT_SECONDARY
    p_d.space_before = Pt(4)

# -------------------------------------------------------------
# SLIDE 16: FUTURE ROADMAP & CONCLUSION
# -------------------------------------------------------------
s16 = create_base_slide()
add_header(s16, "Future Roadmap & Project Conclusion", "LOOKING FORWARD",
           "Expanding QuizQuake into an enterprise-grade adaptive cognitive assessment platform.", 16)

# Left: Roadmap Items; Right: Conclusion & Q&A
c16_l = add_card(s16, Inches(0.8), Inches(2.0), Inches(5.666), Inches(4.8), bg=CARD_BG, border=CARD_BORDER)
tb_l = s16.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(5.1), Inches(4.4))
tf_l = tb_l.text_frame
tf_l.word_wrap = True

p = tf_l.paragraphs[0]
p.text = "PRODUCT EXPANSION ROADMAP"
p.font.name = FONT_BODY
p.font.size = Pt(11)
p.font.bold = True
p.font.color.rgb = ACCENT_BROWN

roadmap = [
    ("Phase 1: Generative LLM Question Engine", "Dynamically generate infinite high-rigor coding questions and unit test tracing using Gemini API."),
    ("Phase 2: LMS LTI 1.3 Standards Integration", "Native one-click embedding into Canvas, Blackboard, and Moodle gradebooks."),
    ("Phase 3: Multi-Candidate Cohort Analytics", "Faculty dashboard displaying real-time class heatmaps and longitudinal ability drift."),
    ("Phase 4: Multi-Language Code Compilation", "Integrate in-browser sandboxed code execution for algorithmic coding challenges.")
]

for title, desc in roadmap:
    pt = tf_l.add_paragraph()
    pt.text = "➔ " + title
    pt.font.name = FONT_BODY
    pt.font.size = Pt(11)
    pt.font.bold = True
    pt.font.color.rgb = TEXT_PRIMARY
    pt.space_before = Pt(7)

    run = pt.add_run()
    run.text = f"\n    {desc}"
    run.font.bold = False
    run.font.size = Pt(10)
    run.font.color.rgb = TEXT_SECONDARY

c16_r = add_card(s16, Inches(6.866), Inches(2.0), Inches(5.666), Inches(4.8), bg=WHITE_BG, border=CARD_BORDER)
tb_r = s16.shapes.add_textbox(Inches(7.15), Inches(2.4), Inches(5.1), Inches(4.0))
tf_r = tb_r.text_frame
tf_r.word_wrap = True

p_r = tf_r.paragraphs[0]
p_r.text = "SUMMARY & CONCLUSION"
p_r.font.name = FONT_BODY
p_r.font.size = Pt(11)
p_r.font.bold = True
p_r.font.color.rgb = ACCENT_CARAMEL

p_r2 = tf_r.add_paragraph()
p_r2.text = "QuizQuake eliminates uniform testing fatigue once and for all."
p_r2.font.name = FONT_TITLE
p_r2.font.size = Pt(20)
p_r2.font.bold = True
p_r2.font.color.rgb = TEXT_PRIMARY
p_r2.space_before = Pt(8)

p_r3 = tf_r.add_paragraph()
p_r3.text = "By combining real-time 3-tier difficulty scaling with granular weak-topic radar mapping and instant remedial drills, QuizQuake transforms testing from an intimidating barrier into an empowering, tailored cognitive growth engine."
p_r3.font.name = FONT_BODY
p_r3.font.size = Pt(11.5)
p_r3.font.color.rgb = TEXT_SECONDARY
p_r3.space_before = Pt(12)

p_r4 = tf_r.add_paragraph()
p_r4.text = "Thank you! We welcome questions and live demonstration requests."
p_r4.font.name = FONT_BODY
p_r4.font.size = Pt(13)
p_r4.font.bold = True
p_r4.font.color.rgb = ACCENT_BROWN
p_r4.space_before = Pt(16)

# -------------------------------------------------------------
# SAVE PRESENTATION
# -------------------------------------------------------------
prs.save(PPT_OUTPUT_PATH)
print(f"SUCCESS: 16-slide presentation saved to {PPT_OUTPUT_PATH}")
