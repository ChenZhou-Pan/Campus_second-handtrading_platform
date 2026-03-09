#!/usr/bin/env python3
"""
生成 10000 条覆盖平台全部分类的二手交易训练数据（简化版特征）。

输出文件：
    sample_secondhand_training_data_basic_10000.csv

字段：
    title, description, category, condition, original_price, final_price

使用方式：
    cd /Users/chenzhou/Projects/Campus_second-handtrading_platform
    python3 generate_basic_10000_dataset.py
"""

import csv
import random
from pathlib import Path

OUTPUT_FILE = Path("sample_secondhand_training_data_basic_10000.csv")
TARGET_SIZE = 10_000


# 平台分类（与 frontend/src/data/categories.ts 对齐，使用 主分类/子分类 的 value）
CATEGORIES = [
    # 电子产品
    ("electronics/phone", "电子产品/手机"),
    ("electronics/tablet", "电子产品/平板电脑"),
    ("electronics/laptop", "电子产品/笔记本电脑"),
    ("electronics/desktop", "电子产品/台式电脑"),
    ("electronics/headphone", "电子产品/耳机/音响"),
    ("electronics/camera", "电子产品/相机/摄像机"),
    ("electronics/watch", "电子产品/智能手表/手环"),
    ("electronics/charger", "电子产品/充电器/数据线"),
    ("electronics/storage", "电子产品/存储设备"),
    ("electronics/accessories", "电子产品/电子配件"),
    ("electronics/other_electronics", "电子产品/其他电子产品"),
    # 图书教材
    ("books/textbook", "图书教材/教材课本"),
    ("books/reference", "图书教材/参考书"),
    ("books/novel", "图书教材/小说文学"),
    ("books/comic", "图书教材/漫画绘本"),
    ("books/magazine", "图书教材/杂志期刊"),
    ("books/exam", "图书教材/考试用书"),
    ("books/language", "图书教材/语言学习"),
    ("books/professional", "图书教材/专业书籍"),
    ("books/other_books", "图书教材/其他图书"),
    # 服装配饰
    ("clothing/top", "服装配饰/上装"),
    ("clothing/bottom", "服装配饰/下装"),
    ("clothing/dress", "服装配饰/连衣裙"),
    ("clothing/outerwear", "服装配饰/外套大衣"),
    ("clothing/shoes", "服装配饰/鞋子"),
    ("clothing/bag", "服装配饰/包包"),
    ("clothing/accessories", "服装配饰/配饰"),
    ("clothing/hat", "服装配饰/帽子"),
    ("clothing/jewelry", "服装配饰/首饰"),
    ("clothing/other_clothing", "服装配饰/其他服装"),
    # 日用百货
    ("daily/cosmetics", "日用百货/化妆品"),
    ("daily/skincare", "日用百货/护肤品"),
    ("daily/personal_care", "日用百货/个人护理"),
    ("daily/kitchen", "日用百货/厨房用品"),
    ("daily/bedding", "日用百货/床上用品"),
    ("daily/storage_box", "日用百货/收纳用品"),
    ("daily/decoration", "日用百货/装饰品"),
    ("daily/stationery", "日用百货/文具用品"),
    ("daily/cleaning", "日用百货/清洁用品"),
    ("daily/other_daily", "日用百货/其他日用品"),
    # 运动用品
    ("sports/fitness", "运动用品/健身器材"),
    ("sports/ball", "运动用品/球类用品"),
    ("sports/outdoor", "运动用品/户外装备"),
    ("sports/swimming", "运动用品/游泳用品"),
    ("sports/yoga", "运动用品/瑜伽用品"),
    ("sports/running", "运动用品/跑步装备"),
    ("sports/cycling", "运动用品/骑行装备"),
    ("sports/sports_shoes", "运动用品/运动鞋"),
    ("sports/sports_clothing", "运动用品/运动服装"),
    ("sports/other_sports", "运动用品/其他运动用品"),
    # 食品饮料
    ("food/snacks", "食品饮料/零食"),
    ("food/drinks", "食品饮料/饮料酒水"),
    ("food/instant_food", "食品饮料/方便食品"),
    ("food/tea_coffee", "食品饮料/茶咖啡"),
    ("food/health_food", "食品饮料/保健食品"),
    ("food/other_food", "食品饮料/其他食品"),
    # 其他
    ("other/furniture", "其他/家具"),
    ("other/appliance", "其他/家电"),
    ("other/toy", "其他/玩具模型"),
    ("other/musical", "其他/乐器"),
    ("other/art", "其他/艺术品收藏品"),
    ("other/ticket", "其他/票券卡券"),
    ("other/service", "其他/服务技能"),
    ("other/other_other", "其他/其他"),
]


# 主分类到价格范围的一个大致映射（元）
MAIN_PRICE_RANGE = {
    "electronics": (100, 8000),
    "books": (10, 200),
    "clothing": (20, 800),
    "daily": (10, 500),
    "sports": (30, 1500),
    "food": (5, 200),
    "other": (30, 3000),
}


CONDITIONS = ["new", "like_new", "good", "fair", "poor"]
CONDITION_PROBS = [0.15, 0.35, 0.3, 0.15, 0.05]

# 各成色对应的折扣区间（成交价 / 原价）
DISCOUNT_RANGE = {
    "new": (0.7, 0.9),
    "like_new": (0.5, 0.8),
    "good": (0.4, 0.7),
    "fair": (0.2, 0.5),
    "poor": (0.1, 0.3),
}


ELECTRONICS_KEYWORDS = [
    "iPhone 13", "iPhone 14", "华为 Mate", "小米手机", "iPad Air", "iPad Pro",
    "MacBook Pro", "轻薄本", "机械键盘", "蓝牙耳机", "降噪耳机", "显示器", "固态硬盘",
]
BOOKS_KEYWORDS = [
    "高数 同济版", "概率论教程", "线性代数", "考研英语真题", "四六级模拟题",
    "专业课教材", "经典小说", "漫画合集", "专业参考书",
]
CLOTHING_KEYWORDS = [
    "卫衣", "牛仔裤", "连帽外套", "运动鞋", "马丁靴", "风衣", "羽绒服", "帆布包", "双肩包",
]
DAILY_KEYWORDS = [
    "台灯", "收纳盒", "宿舍四件套", "电饭煲", "电磁炉", "水壶", "雨伞", "化妆品套装",
]
SPORTS_KEYWORDS = [
    "羽毛球拍", "篮球", "足球", "瑜伽垫", "哑铃套装", "跑步鞋", "骑行头盔", "运动护膝",
]
FOOD_KEYWORDS = [
    "整箱方便面", "饮料套餐", "咖啡粉", "奶茶券", "零食大礼包",
]
OTHER_KEYWORDS = [
    "木吉他", "尤克里里", "画板", "桌游", "手办模型", "小型冰箱", "吹风机",
]

# 一些修饰词/句式片段，用来打散文案（仅用于描述，不再放到标题里）
TITLE_PREFIX = [""]  # 标题保持简短，只做商品精简概括
TITLE_SUFFIX = [""]  # 不在标题里出现“可小刀”“急转”等话术

DESC_USAGE = [
    "主要在宿舍使用",
    "上课通勤时使用",
    "偶尔周末用一下",
    "原本打算长期用，后来闲置",
]
DESC_CONDITION = [
    "整体成色良好",
    "有正常使用痕迹，不影响功能",
    "细节位置有轻微磨损",
    "基本保持干净整洁",
]
DESC_TRADE = [
    "支持当面验货",
    "校内自提优先",
    "也可以邮寄，运费自理",
    "看中的话可以小刀一点",
]


def weighted_choice(items, probs):
    r = random.random()
    cum = 0.0
    for item, p in zip(items, probs):
        cum += p
        if r <= cum:
            return item
    return items[-1]


def generate_title_and_desc(main, sub, zh_label, condition):
    """根据分类生成标题（精简概括）和描述（详细说明）。"""
    prefix = random.choice(TITLE_PREFIX)
    suffix = random.choice(TITLE_SUFFIX)

    if main == "electronics":
        kw = random.choice(ELECTRONICS_KEYWORDS)
        # 随机一些型号/容量/年份
        gb = random.choice([64, 128, 256, 512])
        year = random.choice([2020, 2021, 2022, 2023])
        base_title = f"{kw} {gb}G {year}款"
        # 标题只保留商品关键信息
        title = base_title
        use_part = "主要用来上网课" if "iPad" in kw else "平时学习和娱乐使用"
        wear_part = "外观几乎无划痕" if condition in ("new", "like_new") else "外壳有少量细小划痕"
        desc = f"{base_title}，{use_part}，{wear_part}，无拆修，电池状态良好，{random.choice(DESC_TRADE)}。"

    elif main == "books":
        kw = random.choice(BOOKS_KEYWORDS)
        edition = random.choice(["第七版", "第六版", "最新版", "考研专用"])
        base_title = f"{kw} {edition}"
        title = base_title
        mark_part = random.choice([
            "只有少量铅笔标注",
            "部分章节有荧光笔划线",
            "几乎未写过习题",
        ])
        desc = f"{base_title}，{mark_part}，书脊完好，无缺页，适合备考或平时自学，{random.choice(DESC_TRADE)}。"

    elif main == "clothing":
        kw = random.choice(CLOTHING_KEYWORDS)
        size = random.choice(["S", "M", "L", "XL"])
        base_title = f"{kw} 尺码{size}"
        title = base_title
        wash_part = random.choice([
            "穿着次数不多",
            "只在换季时偶尔穿",
            "洗护得当，颜色保持良好",
        ])
        stain_part = "无明显污渍" if condition in ("new", "like_new") else "细看有少量小污渍"
        desc = f"{base_title}，{wash_part}，{stain_part}，衣服版型正常，不影响日常穿着，{random.choice(DESC_TRADE)}。"

    elif main == "daily":
        kw = random.choice(DAILY_KEYWORDS)
        base_title = kw
        title = base_title
        state_part = "几乎全新" if condition == "new" else "有正常使用痕迹"
        desc = f"{kw}，宿舍自用，{state_part}，一直保持干净，转给需要的同学，{random.choice(DESC_TRADE)}。"

    elif main == "sports":
        kw = random.choice(SPORTS_KEYWORDS)
        base_title = kw
        title = base_title
        wear_part = "整体状态很好" if condition in ("new", "like_new") else "表面有轻微磨损"
        desc = f"{kw}，在学校{random.choice(['操场', '体育馆'])}使用，{wear_part}，适合日常锻炼，{random.choice(DESC_TRADE)}。"

    elif main == "food":
        kw = random.choice(FOOD_KEYWORDS)
        base_title = kw
        title = base_title
        desc = f"{kw}，因为口味或囤多了转让，包装完好，保质期充足，适合宿舍一起拼单。"

    else:  # other
        kw = random.choice(OTHER_KEYWORDS)
        base_title = kw
        title = base_title
        desc = f"{kw}，在校期间使用，{random.choice(DESC_CONDITION)}，适合有同样兴趣的同学，{random.choice(DESC_TRADE)}。"

    # 附加中文分类标签，方便你人工浏览（概率降低一点）
    if random.random() < 0.25:
        title = f"{title}（{zh_label}）"

    return title, desc


def generate_row(i: int):
    # 轮询 + 随机，保证所有分类都能覆盖到，同时打散顺序
    cat_index = (i * 7 + random.randint(0, len(CATEGORIES) - 1)) % len(CATEGORIES)
    category_path, zh_label = CATEGORIES[cat_index]
    main, sub = category_path.split("/")

    # 原价范围
    price_min, price_max = MAIN_PRICE_RANGE.get(main, (30, 1000))
    original_price = random.randint(price_min, price_max)

    # 成色
    condition = weighted_choice(CONDITIONS, CONDITION_PROBS)

    # 折扣
    drange = DISCOUNT_RANGE[condition]
    discount = random.uniform(drange[0], drange[1])
    final_price = max(1, int(original_price * discount))

    # 标题 & 描述
    title, desc = generate_title_and_desc(main, sub, zh_label, condition)

    return {
        "title": title,
        "description": desc,
        "category": category_path,  # 用 "主分类/子分类" 的 value，与你系统一致
        "condition": condition,
        "original_price": original_price,
        "final_price": final_price,
    }


def main():
    random.seed(2025)
    headers = ["title", "description", "category", "condition", "original_price", "final_price"]

    print(f"开始生成 {TARGET_SIZE} 条样本数据...")
    rows = [generate_row(i) for i in range(TARGET_SIZE)]

    with OUTPUT_FILE.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    print(f"已生成文件: {OUTPUT_FILE} （共 {len(rows)} 条）")
    print("你可以在训练前随便打开这个 CSV 浏览和微调。")


if __name__ == "__main__":
    main()

