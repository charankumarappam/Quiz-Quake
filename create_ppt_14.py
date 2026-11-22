import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# -------------------------------------------------------------
# DIRECTORY & ASSET SETUP
# -------------------------------------------------------------
WORKSPACE_DIR = r"c:\Users\varsh\OneDrive\Desktop\quizwquake"
ASSETS_DIR = os.path.join(WORKSPACE_DIR, "ppt_assets")
os.makedirs(ASSETS_DIR, exist_ok=True)

USER_UPLOADED_DIR = r"C:\Users\varsh\.gemini\antigravity\brain\777067c2-91c3-4fe7-a517-91661b6ae225\.user_uploaded"

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
# COLOR PALETTE (Warm Beige & Mocha Brown Theme)
# -------------------------------------------------------------
BG_COLOR       = RGBColor(247, 244, 238)  # #F7F4EE Warm cream beige
CARD_BG        = RGBColor(255, 253, 249)  # #FFFDF9 Warm ivory
CARD_BORDER    = RGBColor(229, 215, 199)  # #E5D7C7 Soft sandstone border
CARD_BORDER_HI = RGBColor(140, 88, 53)    # #8C5835 Cognac active border
WHITE_BG       = RGBColor(255, 255, 255)  # #FFFFFF Pure white for charts/cards

TEXT_PRIMARY   = RGBColor(37, 23, 16)     # #251710 Deep espresso
TEXT_SECONDARY = RGBColor(77, 56, 43)     # #4D382B Roasted coffee
TEXT_MUTED     = RGBColor(122, 100, 85)   # #7A6455 Warm taupe

ACCENT_BROWN   = RGBColor(123, 70, 34)    # #7B4622 Mocha brown
ACCENT_CARAMEL = RGBColor(196, 135, 76)   # #C4874C Caramel bronze
ACCENT_GREEN   = RGBColor(46, 125, 50)    # #2E7D32 Sage green
ACCENT_RED     = RGBColor(220, 38, 38)    # #DC2626 Terracotta red

PILL_BG        = RGBColor(235, 221, 203)  # #EBDDCB Sand pill
PILL_TEXT      = RGBColor(99, 59, 29)     # #633B1D Espresso pill text

FONT_TITLE     = "Georgia"
FONT_BODY      = "Arial"

# Typography sizes reduced by 2px each category as requested
SZ_TITLE = Pt(30)   # Reduced from 32px -> 30px for main titles
SZ_HEAD  = Pt(26)   # Reduced from 28px -> 26px for section / card headers
SZ_BODY  = Pt(22)   # Reduced from 24px -> 22px for primary body text

# -------------------------------------------------------------
# PRESENTATION INITIALIZATION (16:9 Widescreen)
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

def add_header(slide, title_text, category_text="QUIZQUAKE: BRAINSTORM ARENA", slide_num=None):
    # Top Tag Pill (Reduced 12px -> 10px)
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(4.6), Inches(0.32))
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
    p_pill.font.size = Pt(10)
    p_pill.font.bold = True
    p_pill.font.color.rgb = PILL_TEXT
    p_pill.alignment = PP_ALIGN.CENTER

    # Title Box (Main Title: 30px)
    title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.733), Inches(0.7))
    tf = title_box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.name = FONT_TITLE
    p.font.size = SZ_TITLE  # 30 px
    p.font.bold = True
    p.font.color.rgb = TEXT_PRIMARY

    # Footer
    add_footer(slide, slide_num)

def add_footer(slide, slide_num):
    # Thin divider
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.015))
    line.fill.solid()
    line.fill.fore_color.rgb = CARD_BORDER
    line.line.fill.background()

    # Footer text (Reduced 13px -> 11px)
    footer_box = slide.shapes.add_textbox(Inches(0.8), Inches(7.12), Inches(9.5), Inches(0.3))
    tf = footer_box.text_frame
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "QuizQuake: BrainStorm Arena • Computerized Adaptive Testing • Team Size: 3"
    p.font.name = FONT_BODY
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    if slide_num:
        num_box = slide.shapes.add_textbox(Inches(11.0), Inches(7.12), Inches(1.5), Inches(0.3))
        tf_num = num_box.text_frame
        tf_num.margin_left = tf_num.margin_top = tf_num.margin_right = tf_num.margin_bottom = 0
        p_num = tf_num.paragraphs[0]
        p_num.text = f"{slide_num:02d} / 14"
        p_num.font.name = FONT_BODY
        p_num.font.size = Pt(11)
        p_num.font.bold = True
        p_num.font.color.rgb = ACCENT_BROWN
        p_num.alignment = PP_ALIGN.RIGHT

def add_card(slide, left, top, width, height, bg=CARD_BG, border=CARD_BORDER, border_width=1.5):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg
    card.line.color.rgb = border
    card.line.width = Pt(border_width)
    return card

# =============================================================
# SLIDE 1: TITLE SLIDE WITH TEAM MATES INFO
# =============================================================
s1 = create_base_slide()

# Top Hero Container
hero_card = add_card(s1, Inches(0.8), Inches(0.6), Inches(11.733), Inches(2.7), bg=CARD_BG, border=CARD_BORDER, border_width=1.5)

# Pill (Reduced 11px -> 9px)
pill_s1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.1), Inches(0.85), Inches(5.2), Inches(0.35))
pill_s1.fill.solid()
pill_s1.fill.fore_color.rgb = PILL_BG
pill_s1.line.color.rgb = CARD_BORDER
p_pill = pill_s1.text_frame.paragraphs[0]
p_pill.text = "⚡ COMPUTERIZED ADAPTIVE TESTING & COGNITIVE DIAGNOSTICS"
p_pill.font.name = FONT_BODY
p_pill.font.size = Pt(9)
p_pill.font.bold = True
p_pill.font.color.rgb = PILL_TEXT
p_pill.alignment = PP_ALIGN.CENTER

# Main Title (30px)
title_box = s1.shapes.add_textbox(Inches(1.1), Inches(1.3), Inches(11.1), Inches(0.65))
tf1 = title_box.text_frame
tf1.word_wrap = True
tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0
p1 = tf1.paragraphs[0]
p1.text = "QuizQuake: BrainStorm Arena"
p1.font.name = FONT_TITLE
p1.font.size = SZ_TITLE  # 30px
p1.font.bold = True
p1.font.color.rgb = TEXT_PRIMARY

# Subtitle (22px)
sub_box = s1.shapes.add_textbox(Inches(1.1), Inches(2.0), Inches(11.1), Inches(1.1))
tf_sub = sub_box.text_frame
tf_sub.word_wrap = True
tf_sub.margin_left = tf_sub.margin_top = tf_sub.margin_right = tf_sub.margin_bottom = 0
p_sub = tf_sub.paragraphs[0]
p_sub.text = "Real-Time Difficulty Scaling & Heuristic IRT Cognitive Diagnostics"
p_sub.font.name = FONT_BODY
p_sub.font.size = SZ_BODY  # 22px
p_sub.font.bold = True
p_sub.font.color.rgb = ACCENT_BROWN

p_sub2 = tf_sub.add_paragraph()
p_sub2.text = "An intelligent evaluation platform tailoring challenge dynamically to candidate skill."
p_sub2.font.name = FONT_BODY
p_sub2.font.size = Pt(16)  # Reduced 18px -> 16px
p_sub2.font.color.rgb = TEXT_SECONDARY
p_sub2.space_before = Pt(4)

# 3 Team Mates Cards (Horizontal Row)
team_info = [
    ("Teammate 1", "Lead Frontend & UX Architect", 
     "• React 19 & Tailwind Theme Architecture\n• Dynamic Setup & Responsive Layouts\n• State Synchronization & UI Polish", ACCENT_BROWN),
    ("Teammate 2", "Adaptive Engine & IRT Specialist", 
     "• 3-Tier Dynamic Finite State Machine\n• Heuristic IRT Difficulty Calibration\n• Streak Tracking & Demotion Logic", ACCENT_CARAMEL),
    ("Teammate 3", "Data Visualization & Question Lead", 
     "• 64 Curated Question Taxonomy\n• Interactive 4-Axis Radar Diagnostics\n• Cohort Percentile & Remedial Drills", ACCENT_GREEN)
]

for idx, (name, role, details, color) in enumerate(team_info):
    c_left = Inches(0.8 + idx * 4.0)
    card = add_card(s1, c_left, Inches(3.55), Inches(3.733), Inches(3.3), bg=WHITE_BG, border=CARD_BORDER)
    
    tb = s1.shapes.add_textbox(c_left + Inches(0.25), Inches(3.75), Inches(3.233), Inches(2.9))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    # Teammate Name (26px)
    p_name = tf.paragraphs[0]
    p_name.text = name
    p_name.font.name = FONT_TITLE
    p_name.font.size = SZ_HEAD  # 26px
    p_name.font.bold = True
    p_name.font.color.rgb = color
    
    # Role (18px, reduced from 20px)
    p_role = tf.add_paragraph()
    p_role.text = role
    p_role.font.name = FONT_BODY
    p_role.font.size = Pt(18)
    p_role.font.bold = True
    p_role.font.color.rgb = TEXT_PRIMARY
    p_role.space_before = Pt(4)
    
    # Details (15px, reduced from 17px)
    for line in details.split("\n"):
        p_det = tf.add_paragraph()
        p_det.text = line
        p_det.font.name = FONT_BODY
        p_det.font.size = Pt(15)
        p_det.font.color.rgb = TEXT_SECONDARY
        p_det.space_before = Pt(6)

add_footer(s1, 1)

# =============================================================
# SLIDE 2: PROBLEM STATEMENT
# =============================================================
s2 = create_base_slide()
add_header(s2, "Problem Statement: Flaws of Static Standardized Testing", "CHALLENGE & MOTIVATION", 2)

cards_s2 = [
    ("Linear Static Test Fatigue",
     "Conventional quizzes present identical questions regardless of student ability, boring advanced candidates with trivialities and overwhelming novices.",
     ACCENT_BROWN),
    ("Zero Diagnostic Granularity",
     "Traditional numerical scores (e.g. 70%) reveal nothing about specific conceptual deficiencies like OS Deadlocks or Database ACID anomalies.",
     ACCENT_CARAMEL),
    ("Missing Remedial Closure",
     "Standard platforms end at the score screen with no targeted practice loops to repair diagnosed misconceptions immediately.",
     ACCENT_RED)
]

for idx, (title, desc, color) in enumerate(cards_s2):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s2, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s2.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    # Card Header (26px)
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    # Description (22px)
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = SZ_BODY  # 22px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(18)

# =============================================================
# SLIDE 3: PURPOSE & VISION
# =============================================================
s3 = create_base_slide()
add_header(s3, "Purpose & Vision: Intelligent Adaptive Assessment", "MISSION & OBJECTIVES", 3)

cards_s3 = [
    ("Dynamic Difficulty Calibration",
     "Tailor test challenge in real time to accurately measure true candidate capability with fewer questions.",
     ACCENT_BROWN),
    ("Cognitive Deficiency Mapping",
     "Isolate topic-level weak points across core computer science disciplines using multi-axis radar analytics.",
     ACCENT_CARAMEL),
    ("Closing the Learning Loop",
     "Provide instant 1-click remedial drills to convert diagnostic evaluation into immediate skill mastery.",
     ACCENT_GREEN)
]

for idx, (title, desc, color) in enumerate(cards_s3):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s3, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s3.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = SZ_BODY  # 22px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(18)

# =============================================================
# SLIDE 4: TARGET AUDIENCE & USERS
# =============================================================
s4 = create_base_slide()
add_header(s4, "Target Users: Who Benefits From QuizQuake?", "STAKEHOLDERS & REACH", 4)

audience = [
    ("Engineering Students",
     "Undergraduates preparing for campus placements who need rigorous CS fundamentals practice without repetitive easy questions.",
     ACCENT_BROWN),
    ("Technical Job Candidates",
     "Software developers preparing for FAANG-level technical rounds who want accurate percentile benchmarking against real peers.",
     ACCENT_CARAMEL),
    ("Educators & Mentors",
     "Professors and bootcamp instructors who require automated diagnostic heatmaps to detect class-wide conceptual gaps.",
     ACCENT_GREEN)
]

for idx, (title, desc, color) in enumerate(audience):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s4, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s4.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = SZ_BODY  # 22px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(18)

# =============================================================
# SLIDE 5: INNOVATION & COMPETITIVE ADVANTAGE
# =============================================================
s5 = create_base_slide()
add_header(s5, "Innovation: Traditional Tests vs. QuizQuake", "DIFFERENTIATION MATRIX", 5)

# Two large comparative columns
col1 = add_card(s5, Inches(0.8), Inches(1.65), Inches(5.7), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
col2 = add_card(s5, Inches(6.8), Inches(1.65), Inches(5.7), Inches(5.15), bg=WHITE_BG, border=CARD_BORDER_HI, border_width=2)

tb1 = s5.shapes.add_textbox(Inches(1.1), Inches(1.95), Inches(5.1), Inches(4.5))
tf1 = tb1.text_frame
tf1.word_wrap = True
tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

p1 = tf1.paragraphs[0]
p1.text = "Traditional Static Platforms"
p1.font.name = FONT_TITLE
p1.font.size = SZ_HEAD  # 26px
p1.font.bold = True
p1.font.color.rgb = TEXT_MUTED

pts1 = [
    "• Fixed static question order for all candidates",
    "• No real-time response to user performance",
    "• High question count needed to measure ability",
    "• Single scalar score without conceptual insights",
    "• Disconnected practice with zero recovery path"
]
for pt in pts1:
    p = tf1.add_paragraph()
    p.text = pt
    p.font.name = FONT_BODY
    p.font.size = SZ_BODY  # 22px
    p.font.color.rgb = TEXT_SECONDARY
    p.space_before = Pt(14)

tb2 = s5.shapes.add_textbox(Inches(7.1), Inches(1.95), Inches(5.1), Inches(4.5))
tf2 = tb2.text_frame
tf2.word_wrap = True
tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

p2 = tf2.paragraphs[0]
p2.text = "QuizQuake Adaptive Engine"
p2.font.name = FONT_TITLE
p2.font.size = SZ_HEAD  # 26px
p2.font.bold = True
p2.font.color.rgb = ACCENT_BROWN

pts2 = [
    "• Dynamic 3-Tier escalation & recovery",
    "• Real-time difficulty shifts after each answer",
    "• Precise skill rating in 50% fewer questions",
    "• 4-Axis cognitive radar weak-spot diagnosis",
    "• 1-Click instant remedial drill generation"
]
for pt in pts2:
    p = tf2.add_paragraph()
    p.text = pt
    p.font.name = FONT_BODY
    p.font.size = SZ_BODY  # 22px
    p.font.color.rgb = TEXT_PRIMARY
    p.font.bold = True
    p.space_before = Pt(14)

# =============================================================
# SLIDE 6: CORE FEATURE SUITE
# =============================================================
s6 = create_base_slide()
add_header(s6, "Core Feature Suite & User Experience", "FUNCTIONAL CAPABILITIES", 6)

features = [
    ("Configurable Test Setup",
     "Choose 5, 10, 20 or custom question counts alongside Sprint (5m), Standard (10m), or Untimed modes.",
     ACCENT_BROWN),
    ("Dual Assessment Modes",
     "Comprehensive CS Arena for multi-topic evaluation or Domain Deep-Dive for specialized technical drilling.",
     ACCENT_CARAMEL),
    ("Cognitive Feedback",
     "Immediate conceptual explanations, dynamic timer progress, and persistent local attempt history tracking.",
     ACCENT_GREEN)
]

for idx, (title, desc, color) in enumerate(features):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s6, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s6.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = SZ_BODY  # 22px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(18)

# =============================================================
# SLIDE 7: TECHNICAL ARCHITECTURE & STACK
# =============================================================
s7 = create_base_slide()
add_header(s7, "Technical Architecture & Implementation Stack", "SYSTEM DESIGN & PERFORMANCE", 7)

tech_blocks = [
    ("Frontend Architecture",
     "• React 19 & TypeScript\n• Tailwind CSS Design System\n• Lucide Vector Icons Library\n• 100% Responsive Grid",
     ACCENT_BROWN),
    ("Adaptive State Engine",
     "• Deterministic State Machine\n• Heuristic IRT Calculations\n• In-Memory Fast Lookup\n• Zero-Latency Client Transitions",
     ACCENT_CARAMEL),
    ("Data & Visualizations",
     "• HTML5 Canvas Radar Charts\n• Normal Distribution Cohort Math\n• LocalStorage Persistence\n• Zero-Dependency Performance",
     ACCENT_GREEN)
]

for idx, (title, desc, color) in enumerate(tech_blocks):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s7, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=WHITE_BG, border=CARD_BORDER)
    
    tb = s7.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    for line in desc.split("\n"):
        p_line = tf.add_paragraph()
        p_line.text = line
        p_line.font.name = FONT_BODY
        p_line.font.size = SZ_BODY  # 22px
        p_line.font.color.rgb = TEXT_SECONDARY
        p_line.space_before = Pt(14)

# =============================================================
# SLIDE 8: ADAPTIVE ENGINE MECHANICS
# =============================================================
s8 = create_base_slide()
add_header(s8, "Adaptive Engine: 3-Tier State Transition Logic", "ALGORITHMIC MECHANICS", 8)

rules = [
    ("Tier Escalation (+2 Rule)",
     "Two consecutive correct answers at Easy or Medium immediately escalate the candidate to the next higher tier (e.g. Medium ➔ Hard).",
     ACCENT_GREEN),
    ("Tier Demotion (-1 Rule)",
     "A single incorrect answer on a Hard or Medium problem triggers a protective step down to prevent user frustration.",
     ACCENT_RED),
    ("Recovery & Stabilization",
     "Answering correctly after a demotion locks stability, reinforcing confidence before re-attempting advanced concepts.",
     ACCENT_CARAMEL)
]

for idx, (title, desc, color) in enumerate(rules):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s8, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s8.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = SZ_BODY  # 22px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(18)

# =============================================================
# SLIDE 9: DOMAIN TAXONOMY & QUESTION BANK
# =============================================================
s9 = create_base_slide()
add_header(s9, "Domain Taxonomy: 64 Curated Technical Questions", "CURRICULUM ARCHITECTURE", 9)

domains = [
    ("Operating Systems", "16 Questions • Easy, Medium, Hard", "Virtual Memory, Page Replacement, Semaphores, Deadlock Avoidance, Scheduling Algorithms.", ACCENT_BROWN),
    ("Database Management", "16 Questions • Easy, Medium, Hard", "ACID Transactions, B+ Trees, Isolation Anomalies, Normal Forms, Indexing Optimization.", ACCENT_CARAMEL),
    ("Computer Networks", "16 Questions • Easy, Medium, Hard", "TCP Flow & Congestion Control, Subnetting, DNS Resolution, TLS Handshake, OSI Layers.", ACCENT_GREEN),
    ("Data Structures & Algos", "16 Questions • Easy, Medium, Hard", "Dynamic Programming, Graph Traversals, Red-Black Trees, Greedy Bounds, Amortized Analysis.", ACCENT_BROWN)
]

for idx, (d_name, d_sub, d_topics, color) in enumerate(domains):
    row = idx // 2
    col = idx % 2
    c_left = Inches(0.8 + col * 6.0)
    c_top  = Inches(1.65 + row * 2.6)
    
    add_card(s9, c_left, c_top, Inches(5.7), Inches(2.35), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s9.shapes.add_textbox(c_left + Inches(0.3), c_top + Inches(0.2), Inches(5.1), Inches(1.95))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = d_name
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_sub = tf.add_paragraph()
    p_sub.text = d_sub
    p_sub.font.name = FONT_BODY
    p_sub.font.size = Pt(18)  # Reduced 20px -> 18px
    p_sub.font.bold = True
    p_sub.font.color.rgb = TEXT_PRIMARY
    p_sub.space_before = Pt(3)
    
    p_desc = tf.add_paragraph()
    p_desc.text = d_topics
    p_desc.font.name = FONT_BODY
    p_desc.font.size = Pt(17)  # Reduced 19px -> 17px
    p_desc.font.color.rgb = TEXT_MUTED
    p_desc.space_before = Pt(4)

# =============================================================
# SLIDE 10: WEBSITE SHOWCASE (ALL SCREENS)
# =============================================================
s10 = create_base_slide()
add_header(s10, "Website Showcase: Complete Application Interface", "LIVE INTERACTION GALLERY", 10)

img_keys = ["screen_setup_beige.jpg", "screen_cohort_chart.png", "screen_setup_dark.png", "screen_judge_dark.png"]
captions = [
    "Warm Luxury Arena Setup (Custom Questions & Timers)",
    "Peer Cohort Benchmark Distribution Graph",
    "Arena Parameter Selection (Dark Theme Legacy)",
    "Adaptive In-Quiz Engine & Cognitive Header"
]

for idx, k in enumerate(img_keys):
    row = idx // 2
    col = idx % 2
    c_left = Inches(0.8 + col * 6.0)
    c_top  = Inches(1.55 + row * 2.7)
    
    # Outer card
    add_card(s10, c_left, c_top, Inches(5.7), Inches(2.5), bg=WHITE_BG, border=CARD_BORDER)
    
    # Image
    img_path = copied_images.get(k)
    if img_path and os.path.exists(img_path):
        s10.shapes.add_picture(img_path, c_left + Inches(0.15), c_top + Inches(0.15), Inches(5.4), Inches(1.85))
    
    # Caption Box (Reduced 17px -> 15px)
    tb_cap = s10.shapes.add_textbox(c_left + Inches(0.15), c_top + Inches(2.05), Inches(5.4), Inches(0.4))
    tf_cap = tb_cap.text_frame
    tf_cap.word_wrap = True
    tf_cap.margin_left = tf_cap.margin_top = tf_cap.margin_right = tf_cap.margin_bottom = 0
    p_cap = tf_cap.paragraphs[0]
    p_cap.text = captions[idx]
    p_cap.font.name = FONT_BODY
    p_cap.font.size = Pt(15)
    p_cap.font.bold = True
    p_cap.font.color.rgb = TEXT_PRIMARY
    p_cap.alignment = PP_ALIGN.CENTER

# =============================================================
# SLIDE 11: COGNITIVE DIAGNOSTICS & RADAR PROFILING
# =============================================================
s11 = create_base_slide()
add_header(s11, "Cognitive Diagnostics: Multi-Axis Radar Profiling", "DEEP CONCEPTUAL MAPPING", 11)

diag_cards = [
    ("4-Axis Radar Charting",
     "Computes real-time proficiency across OS, DBMS, Networks, and Algorithms to map multi-dimensional skill profiles.",
     ACCENT_BROWN),
    ("Deficiency Isolation",
     "Flags subtopics scoring under 60% with an automated cognitive gap badge (e.g. Deadlocks, TCP BBR Congestion).",
     ACCENT_CARAMEL),
    ("1-Click Targeted Remedial",
     "Instantly generates a customized practice test strictly targeting diagnosed conceptual gaps for rapid remediation.",
     ACCENT_GREEN)
]

for idx, (title, desc, color) in enumerate(diag_cards):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s11, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s11.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = SZ_BODY  # 22px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(18)

# =============================================================
# SLIDE 12: COHORT BENCHMARKS & ANALYTICS
# =============================================================
s12 = create_base_slide()
add_header(s12, "Cohort Benchmarks & Standardized Percentiles", "COMPARATIVE ANALYTICS", 12)

metrics = [
    ("Batch Median Comparison",
     "Directly compares individual accuracy against 1,500+ standardized attempts with real-time median baselines.",
     ACCENT_BROWN),
    ("Top 10% Cutoff Indicator",
     "Clear visual target benchmarks highlight the threshold required to achieve top-decile elite status.",
     ACCENT_CARAMEL),
    ("Motivation & Streaks",
     "Real-time visual streaks, clean score badges, and attempt logs foster long-term student engagement and retention.",
     ACCENT_GREEN)
]

for idx, (title, desc, color) in enumerate(metrics):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s12, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s12.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = SZ_BODY  # 22px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(18)

# =============================================================
# SLIDE 13: FUTURE ROADMAP & EXTENSIONS
# =============================================================
s13 = create_base_slide()
add_header(s13, "Future Roadmap: Scalable Next Horizons", "FUTURE VISION & EXPANSION", 13)

roadmap = [
    ("Mathematical IRT Models",
     "Upgrade from 3-Tier finite state machines to full 2-Parameter and 3-Parameter logistic IRT formulas (θ, a, b, c).",
     ACCENT_BROWN),
    ("Multilingual Question Banks",
     "Expand beyond core CS theory into live code snippet evaluation in Python, C++, Java, and Go.",
     ACCENT_CARAMEL),
    ("Institutional LMS Integration",
     "Export standardized diagnostic reports directly into Canvas, Moodle, and Blackboard for automated grading.",
     ACCENT_GREEN)
]

for idx, (title, desc, color) in enumerate(roadmap):
    c_left = Inches(0.8 + idx * 4.0)
    add_card(s13, c_left, Inches(1.65), Inches(3.733), Inches(5.15), bg=CARD_BG, border=CARD_BORDER)
    
    tb = s13.shapes.add_textbox(c_left + Inches(0.3), Inches(1.95), Inches(3.133), Inches(4.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = SZ_HEAD  # 26px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = SZ_BODY  # 22px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(18)

# =============================================================
# SLIDE 14: THANK YOU & Q&A
# =============================================================
s14 = create_base_slide()

# Giant Centered Card
hero_card14 = add_card(s14, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.8), bg=CARD_BG, border=CARD_BORDER, border_width=1.5)

# Pill (Reduced 11px -> 9px)
pill_s14 = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.4), Inches(1.2), Inches(4.533), Inches(0.35))
pill_s14.fill.solid()
pill_s14.fill.fore_color.rgb = PILL_BG
pill_s14.line.color.rgb = CARD_BORDER
p_pill14 = pill_s14.text_frame.paragraphs[0]
p_pill14.text = "⚡ QUIZQUAKE: BRAINSTORM ARENA"
p_pill14.font.name = FONT_BODY
p_pill14.font.size = Pt(9)
p_pill14.font.bold = True
p_pill14.font.color.rgb = PILL_TEXT
p_pill14.alignment = PP_ALIGN.CENTER

# Main Thank You Title (30px)
tb_ty = s14.shapes.add_textbox(Inches(1.2), Inches(1.75), Inches(10.933), Inches(0.8))
tf_ty = tb_ty.text_frame
tf_ty.word_wrap = True
tf_ty.margin_left = tf_ty.margin_top = tf_ty.margin_right = tf_ty.margin_bottom = 0
p_ty = tf_ty.paragraphs[0]
p_ty.text = "Thank You!"
p_ty.font.name = FONT_TITLE
p_ty.font.size = SZ_TITLE  # 30px
p_ty.font.bold = True
p_ty.font.color.rgb = TEXT_PRIMARY
p_ty.alignment = PP_ALIGN.CENTER

# Subtitle / Questions Header (26px)
p_q = tf_ty.add_paragraph()
p_q.text = "Questions & Discussion"
p_q.font.name = FONT_BODY
p_q.font.size = SZ_HEAD  # 26px
p_q.font.bold = True
p_q.font.color.rgb = ACCENT_BROWN
p_q.alignment = PP_ALIGN.CENTER
p_q.space_before = Pt(6)

# 3 Bottom Summary Cards (20px header, 17px body)
closing_cards = [
    ("Adaptive Testing Engine", "Dynamic 3-tier difficulty scaling ensuring every question matches student capability perfectly.", ACCENT_BROWN),
    ("Cognitive Diagnostics", "Instant radar weak-point isolation paired with 1-click targeted remedial drills.", ACCENT_CARAMEL),
    ("Team of 3 Members", "Collaborative design, intelligent state engineering, and high-yield question taxonomy.", ACCENT_GREEN)
]

for idx, (title, desc, color) in enumerate(closing_cards):
    c_left = Inches(1.2 + idx * 3.7)
    add_card(s14, c_left, Inches(3.6), Inches(3.5), Inches(2.6), bg=WHITE_BG, border=CARD_BORDER)
    
    tb = s14.shapes.add_textbox(c_left + Inches(0.25), Inches(3.8), Inches(3.0), Inches(2.2))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    
    p_head = tf.paragraphs[0]
    p_head.text = title
    p_head.font.name = FONT_TITLE
    p_head.font.size = Pt(20)  # Reduced 22px -> 20px
    p_head.font.bold = True
    p_head.font.color.rgb = color
    
    p_body = tf.add_paragraph()
    p_body.text = desc
    p_body.font.name = FONT_BODY
    p_body.font.size = Pt(17)  # Reduced 19px -> 17px
    p_body.font.color.rgb = TEXT_SECONDARY
    p_body.space_before = Pt(8)

add_footer(s14, 14)

# -------------------------------------------------------------
# SAVE PRESENTATION
# -------------------------------------------------------------
target_paths = [
    os.path.join(WORKSPACE_DIR, "QuizQuake_Presentation_14_Slides.pptx"),
    os.path.join(WORKSPACE_DIR, "QuizQuake_Presentation.pptx"),
]

saved_files = []
for p in target_paths:
    try:
        prs.save(p)
        print(f"SUCCESS: Saved presentation to {p}")
        saved_files.append(p)
    except PermissionError:
        print(f"NOTE: {p} is currently open in PowerPoint (locked by OS).")

if not saved_files:
    fallback = os.path.join(WORKSPACE_DIR, "QuizQuake_Presentation_Latest.pptx")
    prs.save(fallback)
    print(f"SUCCESS: Saved presentation to {fallback}")
