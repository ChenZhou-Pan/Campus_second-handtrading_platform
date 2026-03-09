// 中国省份、城市和学校数据
// 数据来源：https://www.gk100.com/read_64269539.htm
export interface SchoolOption {
  value: string
  label: string
  children?: SchoolOption[]
}

// 全国各省市高校数据（2026年）
export const schoolData: SchoolOption[] = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      { value: 'pku', label: '北京大学' },
      { value: 'tsinghua', label: '清华大学' },
      { value: 'ruc', label: '中国人民大学' },
      { value: 'bnu', label: '北京师范大学' },
      { value: 'bit', label: '北京理工大学' },
      { value: 'buaa', label: '北京航空航天大学' },
      { value: 'ustb', label: '北京科技大学' },
      { value: 'bjtu', label: '北京交通大学' },
      { value: 'bupt', label: '北京邮电大学' },
      { value: 'buct', label: '北京化工大学' },
      { value: 'bjut', label: '北京工业大学' },
      { value: 'bucm', label: '北京中医药大学' },
      { value: 'bfsu', label: '北京外国语大学' },
      { value: 'blcu', label: '北京语言大学' },
      { value: 'cufe', label: '中央财经大学' },
      { value: 'uibe', label: '对外经济贸易大学' },
      { value: 'cuc', label: '中国传媒大学' },
      { value: 'muc', label: '中央民族大学' },
      { value: 'cupl', label: '中国政法大学' },
      { value: 'ncepu', label: '华北电力大学' },
      { value: 'cau', label: '中国农业大学' },
      { value: 'bjfu', label: '北京林业大学' },
      { value: 'cup', label: '中国石油大学（北京）' },
      { value: 'cugb', label: '中国地质大学（北京）' },
      { value: 'cumtb', label: '中国矿业大学（北京）' },
      { value: 'cnu', label: '首都师范大学' },
      { value: 'ccmu', label: '首都医科大学' },
      { value: 'cueb', label: '首都经济贸易大学' },
      { value: 'bsu', label: '北京体育大学' },
      { value: 'ccom', label: '中央音乐学院' },
      { value: 'ccmusic', label: '中国音乐学院' },
      { value: 'cafa', label: '中央美术学院' },
      { value: 'bfa', label: '北京电影学院' },
      { value: 'chda', label: '中央戏剧学院' },
      { value: 'nacta', label: '中国戏曲学院' },
      { value: 'bda', label: '北京舞蹈学院' },
      { value: 'bift', label: '北京服装学院' },
      { value: 'bigc', label: '北京印刷学院' },
      { value: 'bucea', label: '北京建筑大学' },
      { value: 'bipt', label: '北京石油化工学院' },
      { value: 'bac', label: '北京农学院' },
      { value: 'bwu', label: '北京物资学院' },
      { value: 'buu', label: '北京联合大学' },
      { value: 'bistu', label: '北京信息科技大学' },
      { value: 'byc', label: '北京青年政治学院' },
      { value: 'sgit', label: '首钢工学院' },
      { value: 'besti', label: '北京电子科技学院' },
      { value: 'bjpc', label: '北京警察学院' },
      { value: 'culr', label: '中国劳动关系学院' },
      { value: 'cwu', label: '中华女子学院' },
      { value: 'pumc', label: '北京协和医学院' },
      { value: 'bisuu', label: '北京第二外国语学院' },
      { value: 'bcu', label: '北京城市学院' },
      { value: 'bgeely', label: '北京吉利学院' },
    ],
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [
      { value: 'sjtu', label: '上海交通大学' },
      { value: 'fudan', label: '复旦大学' },
      { value: 'tongji', label: '同济大学' },
      { value: 'ecnu', label: '华东师范大学' },
      { value: 'shufe', label: '上海财经大学' },
      { value: 'shisu', label: '上海外国语大学' },
      { value: 'dhu', label: '东华大学' },
      { value: 'shu', label: '上海大学' },
      { value: 'shtcm', label: '上海中医药大学' },
      { value: 'shmtu', label: '上海海事大学' },
      { value: 'sues', label: '上海工程技术大学' },
      { value: 'shou', label: '上海海洋大学' },
      { value: 'shutcm', label: '上海理工大学' },
      { value: 'shnu', label: '上海师范大学' },
      { value: 'shcmu', label: '上海音乐学院' },
      { value: 'shfa', label: '上海戏剧学院' },
      { value: 'shsports', label: '上海体育学院' },
      { value: 'shpt', label: '上海电力大学' },
      { value: 'shuibe', label: '上海对外经贸大学' },
      { value: 'shufe2', label: '上海立信会计金融学院' },
      { value: 'shufe3', label: '上海政法学院' },
      { value: 'shufe4', label: '上海应用技术大学' },
      { value: 'shufe5', label: '上海第二工业大学' },
      { value: 'shufe6', label: '上海电机学院' },
      { value: 'shufe7', label: '上海商学院' },
      { value: 'shufe8', label: '上海海关学院' },
      { value: 'shufe9', label: '上海健康医学院' },
      { value: 'shufe10', label: '上海视觉艺术学院' },
      { value: 'shufe11', label: '上海外国语大学贤达经济人文学院' },
      { value: 'shufe12', label: '上海师范大学天华学院' },
      { value: 'shufe13', label: '上海建桥学院' },
      { value: 'shufe14', label: '上海杉达学院' },
      { value: 'shufe15', label: '上海兴伟学院' },
    ],
  },
  {
    value: 'guangdong',
    label: '广东省',
    children: [
      {
        value: 'guangzhou',
        label: '广州市',
        children: [
          { value: 'sysu', label: '中山大学' },
          { value: 'scut', label: '华南理工大学' },
          { value: 'scnu', label: '华南师范大学' },
          { value: 'jnu', label: '暨南大学' },
          { value: 'gzhu', label: '广州大学' },
          { value: 'gdufs', label: '广东外语外贸大学' },
          { value: 'gdufe', label: '广东财经大学' },
          { value: 'gzmu', label: '广州医科大学' },
          { value: 'gzcmu', label: '广州中医药大学' },
          { value: 'gzpku', label: '广州体育学院' },
          { value: 'gzart', label: '广州美术学院' },
          { value: 'gzmusic', label: '星海音乐学院' },
          { value: 'gztech', label: '广东工业大学' },
          { value: 'gztech2', label: '广东技术师范大学' },
          { value: 'gztech3', label: '广东金融学院' },
          { value: 'gztech4', label: '广东药科大学' },
          { value: 'gztech5', label: '仲恺农业工程学院' },
          { value: 'gztech6', label: '广东第二师范学院' },
          { value: 'gztech7', label: '广州航海学院' },
          { value: 'gztech8', label: '广东警官学院' },
          { value: 'gztech9', label: '广州体育学院' },
          { value: 'gztech10', label: '广东白云学院' },
          { value: 'gztech11', label: '广州商学院' },
          { value: 'gztech12', label: '广东培正学院' },
          { value: 'gztech13', label: '华南理工大学广州学院' },
          { value: 'gztech14', label: '中山大学南方学院' },
          { value: 'gztech15', label: '广东工业大学华立学院' },
        ],
      },
      {
        value: 'shenzhen',
        label: '深圳市',
        children: [
          { value: 'szu', label: '深圳大学' },
          { value: 'sustech', label: '南方科技大学' },
          { value: 'sztech', label: '深圳技术大学' },
          { value: 'sztech2', label: '深圳职业技术学院' },
          { value: 'sztech3', label: '深圳信息职业技术学院' },
        ],
      },
      {
        value: 'shantou',
        label: '汕头市',
        children: [
          { value: 'stu', label: '汕头大学' },
        ],
      },
      {
        value: 'zhuhai',
        label: '珠海市',
        children: [
          { value: 'bnuz', label: '北京师范大学珠海分校' },
          { value: 'jnu', label: '暨南大学珠海校区' },
        ],
      },
      {
        value: 'foshan',
        label: '佛山市',
        children: [
          { value: 'foshan', label: '佛山科学技术学院' },
        ],
      },
      {
        value: 'dongguan',
        label: '东莞市',
        children: [
          { value: 'dgu', label: '东莞理工学院' },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏省',
    children: [
      {
        value: 'nanjing',
        label: '南京市',
        children: [
          { value: 'nju', label: '南京大学' },
          { value: 'seu', label: '东南大学' },
          { value: 'njust', label: '南京理工大学' },
          { value: 'nuaa', label: '南京航空航天大学' },
          { value: 'njtech', label: '南京工业大学' },
          { value: 'njupt', label: '南京邮电大学' },
          { value: 'hhu', label: '河海大学' },
          { value: 'njfu', label: '南京林业大学' },
          { value: 'njau', label: '南京农业大学' },
          { value: 'njmu', label: '南京医科大学' },
          { value: 'njucm', label: '南京中医药大学' },
          { value: 'cpu', label: '中国药科大学' },
          { value: 'njnu', label: '南京师范大学' },
          { value: 'nuist', label: '南京信息工程大学' },
          { value: 'nau', label: '南京审计大学' },
          { value: 'njue', label: '南京财经大学' },
          { value: 'njit', label: '南京工程学院' },
          { value: 'njxzy', label: '南京晓庄学院' },
          { value: 'njart', label: '南京艺术学院' },
          { value: 'njsp', label: '南京体育学院' },
          { value: 'njpc', label: '南京森林警察学院' },
          { value: 'njtech2', label: '金陵科技学院' },
          { value: 'njtech3', label: '三江学院' },
          { value: 'njtech4', label: '南京工业大学浦江学院' },
          { value: 'njtech5', label: '南京理工大学紫金学院' },
          { value: 'njtech6', label: '南京航空航天大学金城学院' },
          { value: 'njtech7', label: '南京师范大学中北学院' },
          { value: 'njtech8', label: '南京信息工程大学滨江学院' },
          { value: 'njtech9', label: '南京审计大学金审学院' },
        ],
      },
      {
        value: 'wuxi',
        label: '无锡市',
        children: [
          { value: 'jiangnan', label: '江南大学' },
        ],
      },
      {
        value: 'suzhou',
        label: '苏州市',
        children: [
          { value: 'suda', label: '苏州大学' },
          { value: 'suda2', label: '苏州科技大学' },
          { value: 'suda3', label: '常熟理工学院' },
          { value: 'suda4', label: '江苏科技大学苏州理工学院' },
        ],
      },
      {
        value: 'xuzhou',
        label: '徐州市',
        children: [
          { value: 'cumt', label: '中国矿业大学' },
          { value: 'xzmu', label: '徐州医科大学' },
          { value: 'jsnu', label: '江苏师范大学' },
          { value: 'cumt2', label: '中国矿业大学徐海学院' },
        ],
      },
      {
        value: 'changzhou',
        label: '常州市',
        children: [
          { value: 'czu', label: '常州大学' },
          { value: 'czu2', label: '常州大学怀德学院' },
        ],
      },
      {
        value: 'zhenjiang',
        label: '镇江市',
        children: [
          { value: 'just', label: '江苏科技大学' },
          { value: 'ujs', label: '江苏大学' },
        ],
      },
      {
        value: 'nantong',
        label: '南通市',
        children: [
          { value: 'ntu', label: '南通大学' },
          { value: 'ntu2', label: '南通大学杏林学院' },
        ],
      },
      {
        value: 'yangzhou',
        label: '扬州市',
        children: [
          { value: 'yzu', label: '扬州大学' },
          { value: 'njupt2', label: '南京邮电大学通达学院' },
        ],
      },
      {
        value: 'taizhou',
        label: '泰州市',
        children: [
          { value: 'njmu2', label: '南京医科大学康达学院' },
          { value: 'njucm2', label: '南京中医药大学翰林学院' },
          { value: 'njnu2', label: '南京师范大学泰州学院' },
        ],
      },
      {
        value: 'huaian',
        label: '淮安市',
        children: [
          { value: 'hytc', label: '淮阴师范学院' },
        ],
      },
      {
        value: 'yancheng',
        label: '盐城市',
        children: [
          { value: 'yctc', label: '盐城师范学院' },
        ],
      },
    ],
  },
  {
    value: 'zhejiang',
    label: '浙江省',
    children: [
      {
        value: 'hangzhou',
        label: '杭州市',
        children: [
          { value: 'zju', label: '浙江大学' },
          { value: 'hdu', label: '杭州电子科技大学' },
          { value: 'zjut', label: '浙江工业大学' },
          { value: 'zjstu', label: '浙江理工大学' },
          { value: 'zjau', label: '浙江农林大学' },
          { value: 'zjcmu', label: '浙江中医药大学' },
          { value: 'hznu', label: '杭州师范大学' },
          { value: 'zjgsu', label: '浙江工商大学' },
          { value: 'cjlu', label: '中国计量大学' },
          { value: 'zjufe', label: '浙江财经大学' },
          { value: 'cafa2', label: '中国美术学院' },
          { value: 'zjtech', label: '浙江科技学院' },
          { value: 'zjweu', label: '浙江水利水电学院' },
          { value: 'zjpc', label: '浙江警察学院' },
          { value: 'zjcm', label: '浙江传媒学院' },
          { value: 'hzmu', label: '杭州医学院' },
          { value: 'zisu', label: '浙江外国语学院' },
          { value: 'zjmusic', label: '浙江音乐学院' },
          { value: 'zjtree', label: '浙江树人学院' },
          { value: 'zjuc', label: '浙江大学城市学院' },
          { value: 'zjut2', label: '浙江工业大学之江学院' },
          { value: 'hdu2', label: '杭州电子科技大学信息工程学院' },
          { value: 'zjstu2', label: '浙江理工大学科技与艺术学院' },
          { value: 'zjgsu2', label: '浙江工商大学杭州商学院' },
          { value: 'zjufe2', label: '浙江财经大学东方学院' },
          { value: 'zjcmu2', label: '浙江中医药大学滨江学院' },
          { value: 'hznu2', label: '杭州师范大学钱江学院' },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波市',
        children: [
          { value: 'nbu', label: '宁波大学' },
          { value: 'nbtech', label: '宁波工程学院' },
          { value: 'nbwl', label: '浙江万里学院' },
          { value: 'zju2', label: '浙江大学宁波理工学院' },
          { value: 'nbu2', label: '宁波大学科学技术学院' },
          { value: 'nbfe', label: '宁波财经学院' },
        ],
      },
      {
        value: 'wenzhou',
        label: '温州市',
        children: [
          { value: 'wzmu', label: '温州医科大学' },
          { value: 'wzu', label: '温州大学' },
          { value: 'wzmu2', label: '温州医科大学仁济学院' },
          { value: 'wzu2', label: '温州大学瓯江学院' },
          { value: 'wzbc', label: '温州商学院' },
        ],
      },
      {
        value: 'jinhua',
        label: '金华市',
        children: [
          { value: 'zjnu', label: '浙江师范大学' },
          { value: 'zjnu2', label: '浙江师范大学行知学院' },
        ],
      },
      {
        value: 'shaoxing',
        label: '绍兴市',
        children: [
          { value: 'sxwl', label: '绍兴文理学院' },
          { value: 'zjyx', label: '浙江越秀外国语学院' },
          { value: 'sxwl2', label: '绍兴文理学院元培学院' },
          { value: 'zjau2', label: '浙江农林大学暨阳学院' },
        ],
      },
      {
        value: 'jiaxing',
        label: '嘉兴市',
        children: [
          { value: 'jxxy', label: '嘉兴学院' },
          { value: 'jxxy2', label: '嘉兴学院南湖学院' },
        ],
      },
      {
        value: 'huzhou',
        label: '湖州市',
        children: [
          { value: 'hztc', label: '湖州师范学院' },
          { value: 'hztc2', label: '湖州师范学院求真学院' },
        ],
      },
      {
        value: 'taizhou2',
        label: '台州市',
        children: [
          { value: 'tzxy', label: '台州学院' },
        ],
      },
      {
        value: 'lishui',
        label: '丽水市',
        children: [
          { value: 'lsxy', label: '丽水学院' },
        ],
      },
      {
        value: 'zhoushan',
        label: '舟山市',
        children: [
          { value: 'zjou', label: '浙江海洋大学' },
        ],
      },
    ],
  },
  {
    value: 'hubei',
    label: '湖北省',
    children: [
      {
        value: 'wuhan',
        label: '武汉市',
        children: [
          { value: 'whu', label: '武汉大学' },
          { value: 'hust', label: '华中科技大学' },
          { value: 'wust', label: '武汉科技大学' },
          { value: 'wit', label: '武汉工程大学' },
          { value: 'cug', label: '中国地质大学（武汉）' },
          { value: 'wtu', label: '武汉纺织大学' },
          { value: 'whpu', label: '武汉轻工大学' },
          { value: 'whut', label: '武汉理工大学' },
          { value: 'hbut', label: '湖北工业大学' },
          { value: 'hzau', label: '华中农业大学' },
          { value: 'hbtcm', label: '湖北中医药大学' },
          { value: 'ccnu', label: '华中师范大学' },
          { value: 'hubu', label: '湖北大学' },
          { value: 'znufe', label: '中南财经政法大学' },
          { value: 'jhun', label: '江汉大学' },
          { value: 'wsp', label: '武汉体育学院' },
          { value: 'hifa', label: '湖北美术学院' },
          { value: 'whcm', label: '武汉音乐学院' },
          { value: 'hbp', label: '湖北警官学院' },
          { value: 'hue', label: '湖北第二师范学院' },
          { value: 'wbu', label: '武汉商学院' },
          { value: 'wdx', label: '武汉东湖学院' },
          { value: 'hkxy', label: '汉口学院' },
          { value: 'wcsy', label: '武昌首义学院' },
          { value: 'wclg', label: '武昌理工学院' },
          { value: 'wssw', label: '武汉生物工程学院' },
          { value: 'wqc', label: '武汉晴川学院' },
          { value: 'hubu2', label: '湖北大学知行学院' },
          { value: 'wcc', label: '武汉城市学院' },
          { value: 'wwl', label: '武汉文理学院' },
          { value: 'hbut2', label: '湖北工业大学工程技术学院' },
          { value: 'wit2', label: '武汉工程大学邮电与信息工程学院' },
          { value: 'wtu2', label: '武汉纺织大学外经贸学院' },
          { value: 'wug', label: '武昌工学院' },
          { value: 'wtbu', label: '武汉工商学院' },
          { value: 'wdsj', label: '武汉设计工程学院' },
          { value: 'whxl', label: '武汉华夏理工学院' },
          { value: 'wcm', label: '武汉传媒学院' },
          { value: 'wgc', label: '武汉工程科技学院' },
        ],
      },
      {
        value: 'yichang',
        label: '宜昌市',
        children: [
          { value: 'ctgu', label: '三峡大学' },
          { value: 'ctgu2', label: '三峡大学科技学院' },
        ],
      },
      {
        value: 'jingzhou',
        label: '荆州市',
        children: [
          { value: 'yangtze', label: '长江大学' },
          { value: 'jzxy', label: '荆州学院' },
        ],
      },
      {
        value: 'xiangyang',
        label: '襄阳市',
        children: [
          { value: 'hbwl', label: '湖北文理学院' },
        ],
      },
      {
        value: 'huanggang',
        label: '黄冈市',
        children: [
          { value: 'hgtc', label: '黄冈师范学院' },
        ],
      },
      {
        value: 'enshi',
        label: '恩施市',
        children: [
          { value: 'hbmu', label: '湖北民族大学' },
        ],
      },
      {
        value: 'shiyan',
        label: '十堰市',
        children: [
          { value: 'hjc', label: '汉江师范学院' },
          { value: 'hqcy', label: '湖北汽车工业学院' },
          { value: 'hmy', label: '湖北医药学院' },
        ],
      },
      {
        value: 'xiaogan',
        label: '孝感市',
        children: [
          { value: 'hbkj', label: '湖北科技学院' },
          { value: 'hbgc', label: '湖北工程学院' },
        ],
      },
      {
        value: 'jingmen',
        label: '荆门市',
        children: [
          { value: 'jclg', label: '荆楚理工学院' },
        ],
      },
      {
        value: 'huangshi',
        label: '黄石市',
        children: [
          { value: 'hblg', label: '湖北理工学院' },
        ],
      },
    ],
  },
  {
    value: 'sichuan',
    label: '四川省',
    children: [
      {
        value: 'chengdu',
        label: '成都市',
        children: [
          { value: 'scu', label: '四川大学' },
          { value: 'swjtu', label: '西南交通大学' },
          { value: 'uestc', label: '电子科技大学' },
          { value: 'swpu', label: '西南石油大学' },
          { value: 'cdut', label: '成都理工大学' },
          { value: 'cuit', label: '成都信息工程大学' },
          { value: 'suse', label: '四川轻化工大学' },
          { value: 'xhu', label: '西华大学' },
          { value: 'cafuc', label: '中国民用航空飞行学院' },
          { value: 'sau', label: '四川农业大学' },
          { value: 'swmu', label: '西南医科大学' },
          { value: 'cdutcm', label: '成都中医药大学' },
          { value: 'nbmc', label: '川北医学院' },
          { value: 'sicnu', label: '四川师范大学' },
          { value: 'cdnu', label: '成都师范学院' },
          { value: 'cdmu', label: '成都医学院' },
          { value: 'sccm', label: '四川音乐学院' },
          { value: 'scfa', label: '四川美术学院' },
          { value: 'scpc', label: '四川警察学院' },
          { value: 'cdu', label: '成都大学' },
          { value: 'cdit', label: '成都工业学院' },
          { value: 'cdly', label: '四川旅游学院' },
          { value: 'scmy', label: '四川电影电视学院' },
          { value: 'cdjc', label: '成都锦城学院' },
          { value: 'cdwl', label: '成都文理学院' },
          { value: 'cdns', label: '成都东软学院' },
          { value: 'scgs', label: '四川工商学院' },
          { value: 'jili', label: '吉利学院' },
          { value: 'uestc2', label: '电子科技大学成都学院' },
          { value: 'cdut2', label: '成都理工大学工程技术学院' },
          { value: 'scmc', label: '四川传媒学院' },
          { value: 'swufe2', label: '西南财经大学天府学院' },
          { value: 'scu2', label: '四川大学锦江学院' },
          { value: 'scwy', label: '四川文化艺术学院' },
          { value: 'swjtu2', label: '西南交通大学希望学院' },
        ],
      },
      {
        value: 'mianyang',
        label: '绵阳市',
        children: [
          { value: 'swust', label: '西南科技大学' },
          { value: 'mytc', label: '绵阳师范学院' },
          { value: 'mycc', label: '绵阳城市学院' },
          { value: 'scit', label: '四川工业科技学院' },
        ],
      },
      {
        value: 'nanchong',
        label: '南充市',
        children: [
          { value: 'cwnu', label: '西华师范大学' },
        ],
      },
      {
        value: 'luzhou',
        label: '泸州市',
        children: [
          { value: 'swmu', label: '西南医科大学' },
        ],
      },
      {
        value: 'yibin',
        label: '宜宾市',
        children: [
          { value: 'ybxy', label: '宜宾学院' },
        ],
      },
      {
        value: 'leshan',
        label: '乐山市',
        children: [
          { value: 'lstc', label: '乐山师范学院' },
        ],
      },
      {
        value: 'dazhou',
        label: '达州市',
        children: [
          { value: 'scwl', label: '四川文理学院' },
        ],
      },
      {
        value: 'yaan',
        label: '雅安市',
        children: [
          { value: 'sau', label: '四川农业大学' },
        ],
      },
      {
        value: 'panzhihua',
        label: '攀枝花市',
        children: [
          { value: 'pzhxy', label: '攀枝花学院' },
        ],
      },
      {
        value: 'xichang',
        label: '西昌市',
        children: [
          { value: 'xcxy', label: '西昌学院' },
        ],
      },
      {
        value: 'aba',
        label: '阿坝州',
        children: [
          { value: 'abtc', label: '阿坝师范学院' },
        ],
      },
      {
        value: 'ganzi',
        label: '甘孜州',
        children: [
          { value: 'scmz', label: '四川民族学院' },
        ],
      },
    ],
  },
  {
    value: 'shaanxi',
    label: '陕西省',
    children: [
      {
        value: 'xian',
        label: '西安市',
        children: [
          { value: 'nwu', label: '西北大学' },
          { value: 'xju', label: '西安交通大学' },
          { value: 'nwpu', label: '西北工业大学' },
          { value: 'xaut', label: '西安理工大学' },
          { value: 'xidian', label: '西安电子科技大学' },
          { value: 'xatu', label: '西安工业大学' },
          { value: 'xauat', label: '西安建筑科技大学' },
          { value: 'xust', label: '西安科技大学' },
          { value: 'xsyu', label: '西安石油大学' },
          { value: 'sust', label: '陕西科技大学' },
          { value: 'xpu', label: '西安工程大学' },
          { value: 'chd', label: '长安大学' },
          { value: 'nwafu', label: '西北农林科技大学' },
          { value: 'sntcm', label: '陕西中医药大学' },
          { value: 'snnu', label: '陕西师范大学' },
          { value: 'xisu', label: '西安外国语大学' },
          { value: 'nwupl', label: '西北政法大学' },
          { value: 'xaipe', label: '西安体育学院' },
          { value: 'xacom', label: '西安音乐学院' },
          { value: 'xafa', label: '西安美术学院' },
          { value: 'xupt', label: '西安邮电大学' },
          { value: 'xaia', label: '西安航空学院' },
          { value: 'xamu', label: '西安医学院' },
          { value: 'xawl', label: '西安文理学院' },
          { value: 'xaph', label: '西安培华学院' },
          { value: 'xacj', label: '西安财经大学' },
          { value: 'xaeu', label: '西安欧亚学院' },
          { value: 'xafy', label: '西安翻译学院' },
          { value: 'xjxy', label: '西京学院' },
          { value: 'xaws', label: '西安外事学院' },
          { value: 'xasy', label: '西安思源学院' },
          { value: 'sxsm', label: '陕西国际商贸学院' },
          { value: 'sxfz', label: '陕西服装工程学院' },
          { value: 'xajt', label: '西安交通工程学院' },
          { value: 'xjtu2', label: '西安交通大学城市学院' },
          { value: 'nwu2', label: '西北大学现代学院' },
          { value: 'xauat2', label: '西安建筑科技大学华清学院' },
          { value: 'xacj2', label: '西安财经大学行知学院' },
          { value: 'sust2', label: '陕西科技大学镐京学院' },
          { value: 'xatu2', label: '西安工业大学北方信息工程学院' },
          { value: 'yadx2', label: '延安大学西安创新学院' },
          { value: 'xidian2', label: '西安电子科技大学长安学院' },
          { value: 'xaut2', label: '西安理工大学高科学院' },
          { value: 'xust2', label: '西安科技大学高新学院' },
        ],
      },
      {
        value: 'xianyang',
        label: '咸阳市',
        children: [
          { value: 'xytc', label: '咸阳师范学院' },
        ],
      },
      {
        value: 'weinan',
        label: '渭南市',
        children: [
          { value: 'wntc', label: '渭南师范学院' },
        ],
      },
      {
        value: 'yanan',
        label: '延安市',
        children: [
          { value: 'yadx', label: '延安大学' },
        ],
      },
      {
        value: 'hanzhong',
        label: '汉中市',
        children: [
          { value: 'snut', label: '陕西理工大学' },
        ],
      },
      {
        value: 'baoji',
        label: '宝鸡市',
        children: [
          { value: 'bjwl', label: '宝鸡文理学院' },
        ],
      },
      {
        value: 'yulin',
        label: '榆林市',
        children: [
          { value: 'ylxy', label: '榆林学院' },
        ],
      },
      {
        value: 'shangluo',
        label: '商洛市',
        children: [
          { value: 'slxy', label: '商洛学院' },
        ],
      },
      {
        value: 'ankang',
        label: '安康市',
        children: [
          { value: 'akxy', label: '安康学院' },
        ],
      },
    ],
  },
  {
    value: 'shandong',
    label: '山东省',
    children: [
      {
        value: 'jinan',
        label: '济南市',
        children: [
          { value: 'sdu', label: '山东大学' },
          { value: 'sdnu', label: '山东师范大学' },
          { value: 'ujn', label: '济南大学' },
          { value: 'sdjzu', label: '山东建筑大学' },
          { value: 'qlu', label: '齐鲁工业大学' },
          { value: 'sdcmu', label: '山东第一医科大学' },
          { value: 'sdcmu2', label: '山东中医药大学' },
          { value: 'sdsp', label: '山东体育学院' },
          { value: 'sdart', label: '山东艺术学院' },
          { value: 'sdqlnu', label: '齐鲁师范学院' },
          { value: 'sdglxy', label: '山东管理学院' },
          { value: 'sdnygc', label: '山东农业工程学院' },
          { value: 'sdpc', label: '山东警察学院' },
          { value: 'sdjt', label: '山东交通学院' },
          { value: 'sdgymy', label: '山东工艺美术学院' },
          { value: 'sdcj', label: '山东财经大学' },
          { value: 'sdcmu3', label: '山东第二医科大学' },
          { value: 'sdhk', label: '山东航空学院' },
          { value: 'jdu', label: '济南大学泉城学院' },
        ],
      },
      {
        value: 'qingdao',
        label: '青岛市',
        children: [
          { value: 'ouc', label: '中国海洋大学' },
          { value: 'qdu', label: '青岛大学' },
          { value: 'qust', label: '青岛科技大学' },
          { value: 'qtech', label: '青岛理工大学' },
          { value: 'qau', label: '青岛农业大学' },
          { value: 'qbh', label: '青岛滨海学院' },
          { value: 'qhh', label: '青岛黄海学院' },
          { value: 'qtech2', label: '青岛理工大学琴岛学院' },
          { value: 'qau2', label: '青岛农业大学海都学院' },
        ],
      },
      {
        value: 'yantai',
        label: '烟台市',
        children: [
          { value: 'ytu', label: '烟台大学' },
          { value: 'sdust', label: '山东科技大学' },
          { value: 'ytu2', label: '烟台大学文经学院' },
        ],
      },
      {
        value: 'weifang',
        label: '潍坊市',
        children: [
          { value: 'wfxy', label: '潍坊学院' },
          { value: 'wfkj', label: '潍坊科技学院' },
          { value: 'wflg', label: '潍坊理工学院' },
        ],
      },
      {
        value: 'zibo',
        label: '淄博市',
        children: [
          { value: 'sdut', label: '山东理工大学' },
          { value: 'zbzy', label: '淄博职业技术大学' },
        ],
      },
      {
        value: 'dongying',
        label: '东营市',
        children: [
          { value: 'upc', label: '中国石油大学（华东）' },
        ],
      },
      {
        value: 'jining',
        label: '济宁市',
        children: [
          { value: 'qfn', label: '曲阜师范大学' },
          { value: 'jnyxy', label: '济宁医学院' },
          { value: 'jnxy', label: '济宁学院' },
        ],
      },
      {
        value: 'taian',
        label: '泰安市',
        children: [
          { value: 'sdau', label: '山东农业大学' },
          { value: 'tsxy', label: '泰山学院' },
          { value: 'sdust2', label: '山东科技大学泰山科技学院' },
        ],
      },
      {
        value: 'linyi',
        label: '临沂市',
        children: [
          { value: 'lyu', label: '临沂大学' },
        ],
      },
      {
        value: 'dezhou',
        label: '德州市',
        children: [
          { value: 'dzxy', label: '德州学院' },
        ],
      },
      {
        value: 'liaocheng',
        label: '聊城市',
        children: [
          { value: 'lcxy', label: '聊城大学' },
        ],
      },
      {
        value: 'binzhou',
        label: '滨州市',
        children: [
          { value: 'bzxy', label: '滨州学院' },
          { value: 'bzmy', label: '滨州医学院' },
        ],
      },
      {
        value: 'heze',
        label: '菏泽市',
        children: [
          { value: 'hzxy', label: '菏泽学院' },
        ],
      },
      {
        value: 'zaozhuang',
        label: '枣庄市',
        children: [
          { value: 'zzxy', label: '枣庄学院' },
        ],
      },
      {
        value: 'rizhao',
        label: '日照市',
        children: [
          { value: 'ldu', label: '鲁东大学' },
        ],
      },
    ],
  },
  {
    value: 'hunan',
    label: '湖南省',
    children: [
      {
        value: 'changsha',
        label: '长沙市',
        children: [
          { value: 'hnu', label: '湖南大学' },
          { value: 'csu', label: '中南大学' },
          { value: 'hnnu', label: '湖南师范大学' },
          { value: 'hnau', label: '湖南农业大学' },
          { value: 'csuft', label: '中南林业科技大学' },
          { value: 'hnutcm', label: '湖南中医药大学' },
          { value: 'csust', label: '长沙理工大学' },
          { value: 'hnust', label: '湖南科技大学' },
          { value: 'hnut', label: '湖南工业大学' },
          { value: 'hncw', label: '湖南财政经济学院' },
          { value: 'hnpc', label: '湖南警察学院' },
          { value: 'hnnz', label: '湖南女子学院' },
          { value: 'hndysf', label: '湖南第一师范学院' },
          { value: 'hnyy', label: '湖南医药学院' },
          { value: 'hnsw', label: '湖南涉外经济学院' },
          { value: 'hnkj', label: '湖南科技学院' },
          { value: 'csxy', label: '长沙学院' },
          { value: 'csyy', label: '长沙医学院' },
          { value: 'cssf', label: '长沙师范学院' },
          { value: 'hnss', label: '湖南信息学院' },
        ],
      },
      {
        value: 'xiangtan',
        label: '湘潭市',
        children: [
          { value: 'xtu', label: '湘潭大学' },
          { value: 'hnlg', label: '湖南理工学院' },
          { value: 'hngc', label: '湖南工程学院' },
          { value: 'xtlg', label: '湘潭理工学院' },
        ],
      },
      {
        value: 'hengyang',
        label: '衡阳市',
        children: [
          { value: 'hynu', label: '衡阳师范学院' },
          { value: 'nhdx', label: '南华大学' },
        ],
      },
      {
        value: 'yueyang',
        label: '岳阳市',
        children: [
          { value: 'hnwl', label: '湖南文理学院' },
        ],
      },
      {
        value: 'zhuzhou',
        label: '株洲市',
        children: [
          { value: 'hnut', label: '湖南工业大学' },
        ],
      },
      {
        value: 'yongzhou',
        label: '永州市',
        children: [
          { value: 'hnkj', label: '湖南科技学院' },
        ],
      },
      {
        value: 'shaoyang',
        label: '邵阳市',
        children: [
          { value: 'syxy', label: '邵阳学院' },
        ],
      },
      {
        value: 'huaihua',
        label: '怀化市',
        children: [
          { value: 'hhxy', label: '怀化学院' },
        ],
      },
      {
        value: 'yiyang',
        label: '益阳市',
        children: [
          { value: 'hncs', label: '湖南城市学院' },
        ],
      },
      {
        value: 'loudi',
        label: '娄底市',
        children: [
          { value: 'hnrk', label: '湖南人文科技学院' },
        ],
      },
      {
        value: 'jishou',
        label: '吉首市',
        children: [
          { value: 'jsdx', label: '吉首大学' },
        ],
      },
      {
        value: 'chenzhou',
        label: '郴州市',
        children: [
          { value: 'xnxy', label: '湘南学院' },
        ],
      },
    ],
  },
  {
    value: 'henan',
    label: '河南省',
    children: [
      {
        value: 'zhengzhou',
        label: '郑州市',
        children: [
          { value: 'ncwu', label: '华北水利水电大学' },
          { value: 'zzu', label: '郑州大学' },
          { value: 'zzuli', label: '郑州轻工业大学' },
          { value: 'haut', label: '河南工业大学' },
          { value: 'haust', label: '河南科技大学' },
          { value: 'zzti', label: '中原工学院' },
          { value: 'henau', label: '河南农业大学' },
          { value: 'hnkj', label: '河南科技学院' },
          { value: 'hnmy', label: '河南牧业经济学院' },
          { value: 'hactcm', label: '河南中医药大学' },
          { value: 'henu', label: '河南大学' },
          { value: 'htnu', label: '河南师范大学' },
          { value: 'xysf', label: '信阳师范大学' },
          { value: 'zzsf', label: '郑州师范学院' },
          { value: 'zzgc', label: '郑州工程技术学院' },
          { value: 'hngc', label: '河南工程学院' },
          { value: 'hncz', label: '河南财政金融学院' },
          { value: 'hnpc', label: '河南警察学院' },
          { value: 'tjp', label: '铁道警察学院' },
          { value: 'zzia', label: '郑州航空工业管理学院' },
          { value: 'huel', label: '河南财经政法大学' },
          { value: 'zzkj', label: '郑州科技学院' },
          { value: 'hhkj', label: '黄河科技学院' },
          { value: 'zzgy', label: '郑州工业应用技术学院' },
          { value: 'zzcj', label: '郑州财经学院' },
          { value: 'htnu2', label: '河南师范大学新联学院' },
          { value: 'zzgs', label: '郑州工商学院' },
          { value: 'zzjm', label: '郑州经贸学院' },
          { value: 'zzsy', label: '郑州商学院' },
          { value: 'zzsd', label: '郑州升达经贸管理学院' },
          { value: 'zzxys', label: '郑州西亚斯学院' },
        ],
      },
      {
        value: 'kaifeng',
        label: '开封市',
        children: [
          { value: 'henu', label: '河南大学' },
          { value: 'hnkf', label: '河南开封科技传媒学院' },
        ],
      },
      {
        value: 'luoyang',
        label: '洛阳市',
        children: [
          { value: 'haust', label: '河南科技大学' },
          { value: 'lylg', label: '洛阳理工学院' },
          { value: 'lysf', label: '洛阳师范学院' },
        ],
      },
      {
        value: 'pingdingshan',
        label: '平顶山市',
        children: [
          { value: 'pdsxy', label: '平顶山学院' },
        ],
      },
      {
        value: 'anyang',
        label: '安阳市',
        children: [
          { value: 'aysf', label: '安阳师范学院' },
          { value: 'aygxy', label: '安阳工学院' },
          { value: 'ayxy', label: '安阳学院' },
        ],
      },
      {
        value: 'hebi',
        label: '鹤壁市',
        children: [
          { value: 'hbxy', label: '鹤壁学院' },
        ],
      },
      {
        value: 'xinxiang',
        label: '新乡市',
        children: [
          { value: 'xxmu', label: '新乡医学院' },
          { value: 'htnu', label: '河南师范大学' },
          { value: 'xxxy', label: '新乡学院' },
          { value: 'xxmu2', label: '新乡医学院三全学院' },
        ],
      },
      {
        value: 'jiaozuo',
        label: '焦作市',
        children: [
          { value: 'hpu', label: '河南理工大学' },
        ],
      },
      {
        value: 'puyang',
        label: '濮阳市',
        children: [
          { value: 'pyxy', label: '濮阳学院' },
        ],
      },
      {
        value: 'xuchang',
        label: '许昌市',
        children: [
          { value: 'xcxy', label: '许昌学院' },
        ],
      },
      {
        value: 'luohe',
        label: '漯河市',
        children: [
          { value: 'lhxy', label: '漯河学院' },
        ],
      },
      {
        value: 'sanmenxia',
        label: '三门峡市',
        children: [
          { value: 'smxxy', label: '三门峡学院' },
        ],
      },
      {
        value: 'nanyang',
        label: '南阳市',
        children: [
          { value: 'nysf', label: '南阳师范学院' },
          { value: 'nylg', label: '南阳理工学院' },
        ],
      },
      {
        value: 'shangqiu',
        label: '商丘市',
        children: [
          { value: 'sqsf', label: '商丘师范学院' },
          { value: 'sqxy', label: '商丘学院' },
          { value: 'sqgxy', label: '商丘工学院' },
        ],
      },
      {
        value: 'xinyang',
        label: '信阳市',
        children: [
          { value: 'xysf', label: '信阳师范大学' },
          { value: 'xynl', label: '信阳农林学院' },
          { value: 'xyxy', label: '信阳学院' },
        ],
      },
      {
        value: 'zhoukou',
        label: '周口市',
        children: [
          { value: 'zksf', label: '周口师范学院' },
        ],
      },
      {
        value: 'zhumadian',
        label: '驻马店市',
        children: [
          { value: 'hkj', label: '黄淮学院' },
        ],
      },
    ],
  },
  {
    value: 'liaoning',
    label: '辽宁省',
    children: [
      {
        value: 'shenyang',
        label: '沈阳市',
        children: [
          { value: 'lnu', label: '辽宁大学' },
          { value: 'neu', label: '东北大学' },
          { value: 'sypu', label: '沈阳工业大学' },
          { value: 'syau', label: '沈阳航空航天大学' },
          { value: 'sylg', label: '沈阳理工大学' },
          { value: 'lnust', label: '辽宁科技大学' },
          { value: 'lnut', label: '辽宁工程技术大学' },
          { value: 'lnpu', label: '辽宁石油化工大学' },
          { value: 'syhg', label: '沈阳化工大学' },
          { value: 'syjz', label: '沈阳建筑大学' },
          { value: 'lnut2', label: '辽宁工业大学' },
          { value: 'syny', label: '沈阳农业大学' },
          { value: 'lnnu', label: '辽宁师范大学' },
          { value: 'synu', label: '沈阳师范大学' },
          { value: 'bdxy', label: '渤海大学' },
          { value: 'assf', label: '鞍山师范学院' },
          { value: 'dlufl', label: '大连外国语大学' },
          { value: 'dufe', label: '东北财经大学' },
          { value: 'ccpc', label: '中国刑事警察学院' },
          { value: 'syph', label: '沈阳药科大学' },
          { value: 'syyxy', label: '沈阳医学院' },
          { value: 'lnhs', label: '辽宁何氏医学院' },
          { value: 'sycm', label: '沈阳音乐学院' },
          { value: 'lumei', label: '鲁迅美术学院' },
          { value: 'syty', label: '沈阳体育学院' },
          { value: 'dlnu', label: '大连民族大学' },
          { value: 'lnkj', label: '辽宁科技学院' },
          { value: 'lnpc', label: '辽宁警察学院' },
          { value: 'syge', label: '沈阳工程学院' },
          { value: 'ldxy', label: '辽东学院' },
          { value: 'sycc', label: '沈阳城市学院' },
          { value: 'lncm', label: '辽宁传媒学院' },
          { value: 'lnlg', label: '辽宁理工学院' },
          { value: 'dlns', label: '大连东软信息学院' },
          { value: 'sygy', label: '沈阳工学院' },
          { value: 'dlys', label: '大连艺术学院' },
          { value: 'lnzydx', label: '辽宁中医药大学杏林学院' },
          { value: 'dlmy', label: '大连医科大学中山学院' },
          { value: 'lnnu2', label: '辽宁师范大学海华学院' },
          { value: 'lnust2', label: '辽宁科技大学信息技术学院' },
          { value: 'syau2', label: '沈阳航空航天大学北方科技学院' },
          { value: 'sycs', label: '沈阳城市建设学院' },
          { value: 'dllg', label: '大连财经学院' },
          { value: 'sykj', label: '沈阳科技学院' },
        ],
      },
      {
        value: 'dalian',
        label: '大连市',
        children: [
          { value: 'dut', label: '大连理工大学' },
          { value: 'dlmu', label: '大连海事大学' },
          { value: 'djtu', label: '大连交通大学' },
          { value: 'dlpu', label: '大连工业大学' },
          { value: 'dlu', label: '大连大学' },
          { value: 'dlmu2', label: '大连医科大学' },
          { value: 'dlns', label: '大连东软信息学院' },
          { value: 'dlys', label: '大连艺术学院' },
        ],
      },
      {
        value: 'anshan',
        label: '鞍山市',
        children: [
          { value: 'lnust', label: '辽宁科技大学' },
        ],
      },
      {
        value: 'fushun',
        label: '抚顺市',
        children: [
          { value: 'lnut', label: '辽宁工程技术大学' },
        ],
      },
      {
        value: 'benxi',
        label: '本溪市',
        children: [
          { value: 'lnkj', label: '辽宁科技学院' },
        ],
      },
      {
        value: 'dandong',
        label: '丹东市',
        children: [
          { value: 'ldxy', label: '辽东学院' },
        ],
      },
      {
        value: 'jinzhou',
        label: '锦州市',
        children: [
          { value: 'bdxy', label: '渤海大学' },
        ],
      },
      {
        value: 'yingkou',
        label: '营口市',
        children: [
          { value: 'ykxy', label: '营口学院' },
        ],
      },
      {
        value: 'fuxin',
        label: '阜新市',
        children: [
          { value: 'lnut', label: '辽宁工程技术大学' },
        ],
      },
      {
        value: 'liaoyang',
        label: '辽阳市',
        children: [
          { value: 'lyxy', label: '辽阳学院' },
        ],
      },
      {
        value: 'panjin',
        label: '盘锦市',
        children: [
          { value: 'pjxy', label: '盘锦学院' },
        ],
      },
      {
        value: 'tieling',
        label: '铁岭市',
        children: [
          { value: 'tlxy', label: '铁岭学院' },
        ],
      },
      {
        value: 'chaoyang',
        label: '朝阳市',
        children: [
          { value: 'cyxy', label: '朝阳学院' },
        ],
      },
      {
        value: 'huludao',
        label: '葫芦岛市',
        children: [
          { value: 'hldxy', label: '葫芦岛学院' },
        ],
      },
    ],
  },
  {
    value: 'jilin',
    label: '吉林省',
    children: [
      {
        value: 'changchun',
        label: '长春市',
        children: [
          { value: 'jlu', label: '吉林大学' },
          { value: 'cust', label: '长春理工大学' },
          { value: 'neepu', label: '东北电力大学' },
          { value: 'ccut', label: '长春工业大学' },
          { value: 'jljz', label: '吉林建筑大学' },
          { value: 'jlhg', label: '吉林化工学院' },
          { value: 'jlau', label: '吉林农业大学' },
          { value: 'ccutcm', label: '长春中医药大学' },
          { value: 'nenu', label: '东北师范大学' },
          { value: 'beihua', label: '北华大学' },
          { value: 'jlnu', label: '吉林师范大学' },
          { value: 'ccsf', label: '长春师范大学' },
          { value: 'jlufe', label: '吉林财经大学' },
          { value: 'jlty', label: '吉林体育学院' },
          { value: 'jlart', label: '吉林艺术学院' },
          { value: 'jlgs', label: '吉林工商学院' },
          { value: 'ccu', label: '长春大学' },
          { value: 'ccgc', label: '长春工程学院' },
          { value: 'jlpc', label: '吉林警察学院' },
          { value: 'jlny', label: '吉林农业科技学院' },
          { value: 'jlyy', label: '吉林医药学院' },
          { value: 'cckj', label: '长春科技学院' },
          { value: 'jlwy', label: '吉林外国语大学' },
          { value: 'jldh', label: '吉林动画学院' },
          { value: 'ccgh', label: '长春光华学院' },
          { value: 'ccut2', label: '长春工业大学人文信息学院' },
          { value: 'cust2', label: '长春理工大学光电信息学院' },
          { value: 'jljz2', label: '吉林建筑大学城建学院' },
          { value: 'cccj', label: '长春财经学院' },
          { value: 'jlnu2', label: '吉林师范大学博达学院' },
          { value: 'ccu2', label: '长春大学旅游学院' },
          { value: 'nenu2', label: '东北师范大学人文学院' },
        ],
      },
      {
        value: 'jilin',
        label: '吉林市',
        children: [
          { value: 'neepu', label: '东北电力大学' },
          { value: 'beihua', label: '北华大学' },
          { value: 'jlnu', label: '吉林师范大学' },
        ],
      },
      {
        value: 'yanji',
        label: '延边市',
        children: [
          { value: 'ybu', label: '延边大学' },
        ],
      },
      {
        value: 'siping',
        label: '四平市',
        children: [
          { value: 'jlnu', label: '吉林师范大学' },
        ],
      },
      {
        value: 'tonghua',
        label: '通化市',
        children: [
          { value: 'thsf', label: '通化师范学院' },
        ],
      },
      {
        value: 'baicheng',
        label: '白城市',
        children: [
          { value: 'bcsf', label: '白城师范学院' },
        ],
      },
      {
        value: 'songyuan',
        label: '松原市',
        children: [
          { value: 'syxy', label: '松原学院' },
        ],
      },
    ],
  },
  {
    value: 'heilongjiang',
    label: '黑龙江省',
    children: [
      {
        value: 'harbin',
        label: '哈尔滨市',
        children: [
          { value: 'hlju', label: '黑龙江大学' },
          { value: 'hit', label: '哈尔滨工业大学' },
          { value: 'hrbust', label: '哈尔滨理工大学' },
          { value: 'hrbeu', label: '哈尔滨工程大学' },
          { value: 'hljust', label: '黑龙江科技大学' },
          { value: 'nepu', label: '东北石油大学' },
          { value: 'neau', label: '东北农业大学' },
          { value: 'nefu', label: '东北林业大学' },
          { value: 'hrbmu', label: '哈尔滨医科大学' },
          { value: 'hljzy', label: '黑龙江中医药大学' },
          { value: 'hrbnu', label: '哈尔滨师范大学' },
          { value: 'hrbsy', label: '哈尔滨商业大学' },
          { value: 'hrbty', label: '哈尔滨体育学院' },
          { value: 'hrbjr', label: '哈尔滨金融学院' },
          { value: 'hrbxy', label: '哈尔滨学院' },
          { value: 'hljgc', label: '黑龙江工程学院' },
          { value: 'hljgy', label: '黑龙江工业学院' },
          { value: 'hrbcm', label: '哈尔滨音乐学院' },
          { value: 'hljwy', label: '黑龙江外国语学院' },
          { value: 'hrbxx', label: '哈尔滨信息工程学院' },
          { value: 'hljcj', label: '黑龙江财经学院' },
          { value: 'hrbsy2', label: '哈尔滨石油学院' },
          { value: 'hljgs', label: '黑龙江工商学院' },
          { value: 'hrbyd', label: '哈尔滨远东理工学院' },
          { value: 'hrbjq', label: '哈尔滨剑桥学院' },
          { value: 'hljgc2', label: '黑龙江工程学院昆仑旅游学院' },
          { value: 'hrbgs', label: '哈尔滨广厦学院' },
          { value: 'hrbhd', label: '哈尔滨华德学院' },
          { value: 'hljdf', label: '黑龙江东方学院' },
        ],
      },
      {
        value: 'qiqihar',
        label: '齐齐哈尔市',
        children: [
          { value: 'qqhru', label: '齐齐哈尔大学' },
          { value: 'qqhmy', label: '齐齐哈尔医学院' },
        ],
      },
      {
        value: 'jiamusi',
        label: '佳木斯市',
        children: [
          { value: 'jmsu', label: '佳木斯大学' },
        ],
      },
      {
        value: 'mudanjiang',
        label: '牡丹江市',
        children: [
          { value: 'mdjmy', label: '牡丹江医学院' },
          { value: 'mdjsf', label: '牡丹江师范学院' },
        ],
      },
      {
        value: 'daqing',
        label: '大庆市',
        children: [
          { value: 'nepu', label: '东北石油大学' },
          { value: 'dqsf', label: '大庆师范学院' },
        ],
      },
      {
        value: 'yichun',
        label: '伊春市',
        children: [
          { value: 'ycxy', label: '伊春学院' },
        ],
      },
      {
        value: 'jixi',
        label: '鸡西市',
        children: [
          { value: 'jxxy', label: '鸡西学院' },
        ],
      },
      {
        value: 'hegang',
        label: '鹤岗市',
        children: [
          { value: 'hgxy', label: '鹤岗学院' },
        ],
      },
      {
        value: 'shuangyashan',
        label: '双鸭山市',
        children: [
          { value: 'sysxy', label: '双鸭山学院' },
        ],
      },
      {
        value: 'qitaihe',
        label: '七台河市',
        children: [
          { value: 'qthxy', label: '七台河学院' },
        ],
      },
      {
        value: 'suihua',
        label: '绥化市',
        children: [
          { value: 'shxy', label: '绥化学院' },
        ],
      },
      {
        value: 'heihe',
        label: '黑河市',
        children: [
          { value: 'hhxy', label: '黑河学院' },
        ],
      },
    ],
  },
  {
    value: 'fujian',
    label: '福建省',
    children: [
      {
        value: 'fuzhou',
        label: '福州市',
        children: [
          { value: 'fzu', label: '福州大学' },
          { value: 'fjut', label: '福建理工大学' },
          { value: 'fjau', label: '福建农林大学' },
          { value: 'fjmu', label: '福建医科大学' },
          { value: 'fjutcm', label: '福建中医药大学' },
          { value: 'fjnu', label: '福建师范大学' },
          { value: 'mjxy', label: '闽江学院' },
          { value: 'fjsy', label: '福建商学院' },
          { value: 'fjpc', label: '福建警察学院' },
          { value: 'fjjs', label: '福建技术师范学院' },
          { value: 'fjjx', label: '福建江夏学院' },
          { value: 'fjsy2', label: '福建师范大学协和学院' },
          { value: 'fjau2', label: '福建农林大学东方学院' },
          { value: 'fzwy', label: '福州外语外贸学院' },
          { value: 'fjlg', label: '福州理工学院' },
        ],
      },
      {
        value: 'xiamen',
        label: '厦门市',
        children: [
          { value: 'xmu', label: '厦门大学' },
          { value: 'jmu', label: '集美大学' },
          { value: 'xmlg', label: '厦门理工学院' },
          { value: 'xmyy', label: '厦门医学院' },
          { value: 'xmu2', label: '厦门大学嘉庚学院' },
          { value: 'xmhg', label: '厦门工学院' },
          { value: 'xmhs', label: '厦门华厦学院' },
        ],
      },
      {
        value: 'quanzhou',
        label: '泉州市',
        children: [
          { value: 'hqu', label: '华侨大学' },
          { value: 'qzsf', label: '泉州师范学院' },
          { value: 'qzmnsf', label: '闽南师范大学' },
          { value: 'qzxx', label: '泉州信息工程学院' },
          { value: 'qzmng', label: '闽南理工学院' },
          { value: 'qzzy', label: '泉州职业技术大学' },
        ],
      },
      {
        value: 'putian',
        label: '莆田市',
        children: [
          { value: 'ptxy', label: '莆田学院' },
        ],
      },
      {
        value: 'sanming',
        label: '三明市',
        children: [
          { value: 'smxy', label: '三明学院' },
        ],
      },
      {
        value: 'zhangzhou',
        label: '漳州市',
        children: [
          { value: 'qzmnsf', label: '闽南师范大学' },
        ],
      },
      {
        value: 'nanping',
        label: '南平市',
        children: [
          { value: 'wyxy', label: '武夷学院' },
        ],
      },
      {
        value: 'longyan',
        label: '龙岩市',
        children: [
          { value: 'lyxy', label: '龙岩学院' },
        ],
      },
      {
        value: 'ningde',
        label: '宁德市',
        children: [
          { value: 'ndsf', label: '宁德师范学院' },
        ],
      },
    ],
  },
  {
    value: 'anhui',
    label: '安徽省',
    children: [
      {
        value: 'hefei',
        label: '合肥市',
        children: [
          { value: 'ahu', label: '安徽大学' },
          { value: 'ustc', label: '中国科学技术大学' },
          { value: 'hfut', label: '合肥工业大学' },
          { value: 'ahut', label: '安徽工业大学' },
          { value: 'aust', label: '安徽理工大学' },
          { value: 'ahpu', label: '安徽工程大学' },
          { value: 'ahau', label: '安徽农业大学' },
          { value: 'ahmu', label: '安徽医科大学' },
          { value: 'bbmu', label: '蚌埠医科大学' },
          { value: 'wnmc', label: '皖南医学院' },
          { value: 'ahtcm', label: '安徽中医药大学' },
          { value: 'ahnu', label: '安徽师范大学' },
          { value: 'hfsf', label: '合肥师范学院' },
          { value: 'ahcj', label: '安徽财经大学' },
          { value: 'ahys', label: '安徽艺术学院' },
          { value: 'ahga', label: '安徽公安学院' },
          { value: 'hfxy', label: '合肥学院' },
          { value: 'ahkj', label: '安徽科技学院' },
          { value: 'ahsl', label: '安徽三联学院' },
          { value: 'ahwd', label: '安徽文达信息工程学院' },
          { value: 'ahxh', label: '安徽新华学院' },
          { value: 'ahwy', label: '安徽外国语学院' },
          { value: 'wjlg', label: '皖江工学院' },
          { value: 'ahxx', label: '安徽信息工程学院' },
          { value: 'hfcs', label: '合肥城市学院' },
        ],
      },
      {
        value: 'wuhu',
        label: '芜湖市',
        children: [
          { value: 'ahpu', label: '安徽工程大学' },
        ],
      },
      {
        value: 'bengbu',
        label: '蚌埠市',
        children: [
          { value: 'bbmu', label: '蚌埠医科大学' },
          { value: 'bbxy', label: '蚌埠学院' },
          { value: 'bbgs', label: '蚌埠工商学院' },
        ],
      },
      {
        value: 'huainan',
        label: '淮南市',
        children: [
          { value: 'aust', label: '安徽理工大学' },
        ],
      },
      {
        value: 'maanshan',
        label: '马鞍山市',
        children: [
          { value: 'ahut', label: '安徽工业大学' },
          { value: 'masxy', label: '马鞍山学院' },
        ],
      },
      {
        value: 'huaibei',
        label: '淮北市',
        children: [
          { value: 'hbsf', label: '淮北师范大学' },
        ],
      },
      {
        value: 'tongling',
        label: '铜陵市',
        children: [
          { value: 'tlxy', label: '铜陵学院' },
        ],
      },
      {
        value: 'anqing',
        label: '安庆市',
        children: [
          { value: 'aqsf', label: '安庆师范大学' },
        ],
      },
      {
        value: 'huangshan',
        label: '黄山市',
        children: [
          { value: 'hsxy', label: '黄山学院' },
        ],
      },
      {
        value: 'chuzhou',
        label: '滁州市',
        children: [
          { value: 'czxy', label: '滁州学院' },
        ],
      },
      {
        value: 'fuyang',
        label: '阜阳市',
        children: [
          { value: 'fysf', label: '阜阳师范大学' },
        ],
      },
      {
        value: 'suzhou2',
        label: '宿州市',
        children: [
          { value: 'szxy', label: '宿州学院' },
        ],
      },
      {
        value: 'liuan',
        label: '六安市',
        children: [
          { value: 'wxxy', label: '皖西学院' },
        ],
      },
      {
        value: 'bozhou',
        label: '亳州市',
        children: [
          { value: 'bzxy', label: '亳州学院' },
        ],
      },
      {
        value: 'chizhou',
        label: '池州市',
        children: [
          { value: 'czxy2', label: '池州学院' },
        ],
      },
      {
        value: 'xuancheng',
        label: '宣城市',
        children: [
          { value: 'xcxy', label: '宣城学院' },
        ],
      },
    ],
  },
  {
    value: 'jiangxi',
    label: '江西省',
    children: [
      {
        value: 'nanchang',
        label: '南昌市',
        children: [
          { value: 'ncu', label: '南昌大学' },
          { value: 'ecjtu', label: '华东交通大学' },
          { value: 'ecit', label: '东华理工大学' },
          { value: 'nchu', label: '南昌航空大学' },
          { value: 'jxust', label: '江西理工大学' },
          { value: 'jci', label: '景德镇陶瓷大学' },
          { value: 'jxau', label: '江西农业大学' },
          { value: 'jxtcm', label: '江西中医药大学' },
          { value: 'gnmu', label: '赣南医科大学' },
          { value: 'jxnu', label: '江西师范大学' },
          { value: 'jxufe', label: '江西财经大学' },
          { value: 'jxkj', label: '江西科技师范大学' },
          { value: 'ncit', label: '南昌工程学院' },
          { value: 'jxpc', label: '江西警察学院' },
          { value: 'xyxy', label: '新余学院' },
          { value: 'ncsf', label: '南昌师范学院' },
          { value: 'jxkj2', label: '江西科技学院' },
          { value: 'nclg', label: '南昌理工学院' },
          { value: 'jxgcy', label: '江西工程学院' },
          { value: 'jxyykj', label: '江西应用科技学院' },
          { value: 'ncgy', label: '南昌工学院' },
          { value: 'ncu2', label: '南昌大学科学技术学院' },
          { value: 'nchu2', label: '南昌航空大学科技学院' },
          { value: 'jxust2', label: '江西理工大学应用科学学院' },
          { value: 'ecit2', label: '东华理工大学长江学院' },
          { value: 'jxau2', label: '江西农业大学南昌商学院' },
          { value: 'jxtcm2', label: '江西中医药大学科技学院' },
          { value: 'gnmu2', label: '赣南医科大学临床医学院' },
          { value: 'jxnu2', label: '江西师范大学科学技术学院' },
        ],
      },
      {
        value: 'ganzhou',
        label: '赣州市',
        children: [
          { value: 'jxust', label: '江西理工大学' },
          { value: 'gnnu', label: '赣南师范大学' },
          { value: 'gnmu', label: '赣南医科大学' },
        ],
      },
      {
        value: 'jiujiang',
        label: '九江市',
        children: [
          { value: 'jjxy', label: '九江学院' },
        ],
      },
      {
        value: 'jingdezhen',
        label: '景德镇市',
        children: [
          { value: 'jci', label: '景德镇陶瓷大学' },
          { value: 'jdzxy', label: '景德镇学院' },
        ],
      },
      {
        value: 'pingxiang',
        label: '萍乡市',
        children: [
          { value: 'pxxy', label: '萍乡学院' },
        ],
      },
      {
        value: 'xinyu',
        label: '新余市',
        children: [
          { value: 'xyxy', label: '新余学院' },
        ],
      },
      {
        value: 'yingtan',
        label: '鹰潭市',
        children: [
          { value: 'ytxy', label: '鹰潭学院' },
        ],
      },
      {
        value: 'shangrao',
        label: '上饶市',
        children: [
          { value: 'srsf', label: '上饶师范学院' },
        ],
      },
      {
        value: 'yichun2',
        label: '宜春市',
        children: [
          { value: 'ycxy', label: '宜春学院' },
        ],
      },
      {
        value: 'jian',
        label: '吉安市',
        children: [
          { value: 'jgsdx', label: '井冈山大学' },
        ],
      },
      {
        value: 'fuzhou2',
        label: '抚州市',
        children: [
          { value: 'fzxy', label: '抚州学院' },
        ],
      },
    ],
  },
  {
    value: 'hebei',
    label: '河北省',
    children: [
      {
        value: 'shijiazhuang',
        label: '石家庄市',
        children: [
          { value: 'hebei', label: '河北大学' },
          { value: 'hegong', label: '河北工程大学' },
          { value: 'hedz', label: '河北地质大学' },
          { value: 'hebut', label: '河北工业大学' },
          { value: 'ncst', label: '华北理工大学' },
          { value: 'hekj', label: '河北科技大学' },
          { value: 'hejz', label: '河北建筑工程学院' },
          { value: 'hesl', label: '河北水利电力学院' },
          { value: 'heny', label: '河北农业大学' },
          { value: 'heyy', label: '河北医科大学' },
          { value: 'hebf', label: '河北北方学院' },
          { value: 'hebtu', label: '河北师范大学' },
          { value: 'bdxy', label: '保定学院' },
          { value: 'hemz', label: '河北民族师范学院' },
          { value: 'tssf', label: '唐山师范学院' },
          { value: 'lfsf', label: '廊坊师范学院' },
          { value: 'hsxy', label: '衡水学院' },
          { value: 'sjzxy', label: '石家庄学院' },
          { value: 'hdxy', label: '邯郸学院' },
          { value: 'xtxy', label: '邢台学院' },
          { value: 'czsf', label: '沧州师范学院' },
          { value: 'sjztd', label: '石家庄铁道大学' },
          { value: 'ysu', label: '燕山大学' },
          { value: 'hekj2', label: '河北科技师范学院' },
          { value: 'tsxy', label: '唐山学院' },
          { value: 'hbkj', label: '华北科技学院' },
          { value: 'zgrm', label: '中国人民警察大学' },
          { value: 'hety', label: '河北体育学院' },
          { value: 'hejr', label: '河北金融学院' },
          { value: 'bhht', label: '北华航天工业学院' },
          { value: 'fzkj', label: '防灾科技学院' },
          { value: 'hejm', label: '河北经贸大学' },
          { value: 'zysf', label: '中央司法警官学院' },
          { value: 'hecm', label: '河北传媒学院' },
          { value: 'hegc', label: '河北工程技术学院' },
          { value: 'hems', label: '河北美术学院' },
          { value: 'hekj3', label: '河北科技学院' },
          { value: 'hewy', label: '河北外国语学院' },
          { value: 'hedf', label: '河北东方学院' },
          { value: 'yjlg', label: '燕京理工学院' },
          { value: 'hezy', label: '河北中医学院' },
          { value: 'sjztd2', label: '石家庄铁道大学四方学院' },
          { value: 'hedz2', label: '河北地质大学华信学院' },
          { value: 'hebut2', label: '河北工业大学城市学院' },
          { value: 'hekj4', label: '河北科技大学理工学院' },
          { value: 'hebtu2', label: '河北师范大学汇华学院' },
          { value: 'hejm2', label: '河北经贸大学经济管理学院' },
          { value: 'heyy2', label: '河北医科大学临床学院' },
          { value: 'ncst2', label: '华北理工大学轻工学院' },
          { value: 'ncst3', label: '华北理工大学冀唐学院' },
          { value: 'hegong2', label: '河北工程大学科信学院' },
          { value: 'heny2', label: '河北农业大学现代科技学院' },
          { value: 'hebtu3', label: '河北师范大学仁和学院' },
          { value: 'hekj5', label: '河北科技师范学院理工学院' },
          { value: 'ysu2', label: '燕山大学里仁学院' },
        ],
      },
      {
        value: 'baoding',
        label: '保定市',
        children: [
          { value: 'hebei', label: '河北大学' },
          { value: 'heny', label: '河北农业大学' },
          { value: 'bdxy', label: '保定学院' },
        ],
      },
      {
        value: 'tangshan',
        label: '唐山市',
        children: [
          { value: 'ncst', label: '华北理工大学' },
          { value: 'tssf', label: '唐山师范学院' },
          { value: 'tsxy', label: '唐山学院' },
        ],
      },
      {
        value: 'qinhuangdao',
        label: '秦皇岛市',
        children: [
          { value: 'ysu', label: '燕山大学' },
        ],
      },
      {
        value: 'handan',
        label: '邯郸市',
        children: [
          { value: 'hegong', label: '河北工程大学' },
          { value: 'hdxy', label: '邯郸学院' },
        ],
      },
      {
        value: 'xingtai',
        label: '邢台市',
        children: [
          { value: 'xtxy', label: '邢台学院' },
        ],
      },
      {
        value: 'langfang',
        label: '廊坊市',
        children: [
          { value: 'lfsf', label: '廊坊师范学院' },
        ],
      },
      {
        value: 'hengshui',
        label: '衡水市',
        children: [
          { value: 'hsxy', label: '衡水学院' },
        ],
      },
      {
        value: 'cangzhou',
        label: '沧州市',
        children: [
          { value: 'czsf', label: '沧州师范学院' },
        ],
      },
      {
        value: 'chengde',
        label: '承德市',
        children: [
          { value: 'cdmy', label: '承德医学院' },
          { value: 'hemz', label: '河北民族师范学院' },
        ],
      },
      {
        value: 'zhangjiakou',
        label: '张家口市',
        children: [
          { value: 'hebf', label: '河北北方学院' },
        ],
      },
    ],
  },
  {
    value: 'shanxi',
    label: '山西省',
    children: [
      {
        value: 'taiyuan',
        label: '太原市',
        children: [
          { value: 'sxu', label: '山西大学' },
          { value: 'tykj', label: '太原科技大学' },
          { value: 'nuc', label: '中北大学' },
          { value: 'tyut', label: '太原理工大学' },
          { value: 'sxny', label: '山西农业大学' },
          { value: 'sxmu', label: '山西医科大学' },
          { value: 'sxsf', label: '山西师范大学' },
          { value: 'tysf', label: '太原师范学院' },
          { value: 'sxdt', label: '山西大同大学' },
          { value: 'sxcz', label: '山西财经大学' },
          { value: 'tygy', label: '太原工业学院' },
          { value: 'sxpc', label: '山西警察学院' },
          { value: 'sxyykj', label: '山西应用科技学院' },
          { value: 'sxgc', label: '山西工程技术学院' },
          { value: 'sxzy', label: '山西中医药大学' },
          { value: 'sxcm', label: '山西传媒学院' },
          { value: 'sxny2', label: '山西能源学院' },
          { value: 'sxgc2', label: '山西工程学院' },
          { value: 'sxgy', label: '山西工学院' },
          { value: 'sxkj', label: '山西科技学院' },
          { value: 'sxdz', label: '山西电子科技学院' },
          { value: 'sxsf2', label: '山西师范大学现代文理学院' },
          { value: 'sxmu2', label: '山西医科大学晋祠学院' },
          { value: 'sxgs', label: '山西工商学院' },
          { value: 'sxjz', label: '山西晋中理工学院' },
          { value: 'jzxx', label: '晋中信息学院' },
          { value: 'yczydx', label: '运城职业技术大学' },
        ],
      },
      {
        value: 'datong',
        label: '大同市',
        children: [
          { value: 'sxdt', label: '山西大同大学' },
        ],
      },
      {
        value: 'yangquan',
        label: '阳泉市',
        children: [
          { value: 'yqxy', label: '阳泉学院' },
        ],
      },
      {
        value: 'changzhi',
        label: '长治市',
        children: [
          { value: 'czmy', label: '长治医学院' },
          { value: 'czxy', label: '长治学院' },
        ],
      },
      {
        value: 'jincheng',
        label: '晋城市',
        children: [
          { value: 'jcxy', label: '晋城学院' },
        ],
      },
      {
        value: 'shuozhou',
        label: '朔州市',
        children: [
          { value: 'szxy', label: '朔州学院' },
        ],
      },
      {
        value: 'jinzhong',
        label: '晋中市',
        children: [
          { value: 'jzxy', label: '晋中学院' },
        ],
      },
      {
        value: 'yuncheng',
        label: '运城市',
        children: [
          { value: 'ycxy', label: '运城学院' },
        ],
      },
      {
        value: 'xinzhou',
        label: '忻州市',
        children: [
          { value: 'xzsf', label: '忻州师范学院' },
        ],
      },
      {
        value: 'linfen',
        label: '临汾市',
        children: [
          { value: 'sxsf', label: '山西师范大学' },
        ],
      },
      {
        value: 'lvliang',
        label: '吕梁市',
        children: [
          { value: 'llxy', label: '吕梁学院' },
        ],
      },
    ],
  },
  {
    value: 'yunnan',
    label: '云南省',
    children: [
      {
        value: 'kunming',
        label: '昆明市',
        children: [
          { value: 'ynu', label: '云南大学' },
          { value: 'kmust', label: '昆明理工大学' },
          { value: 'ynau', label: '云南农业大学' },
          { value: 'xnly', label: '西南林业大学' },
          { value: 'kmmu', label: '昆明医科大学' },
          { value: 'ynutcm', label: '云南中医药大学' },
          { value: 'ynnu', label: '云南师范大学' },
          { value: 'yncz', label: '云南财经大学' },
          { value: 'ynys', label: '云南艺术学院' },
          { value: 'ynmz', label: '云南民族大学' },
          { value: 'kmjg', label: '云南警官学院' },
          { value: 'kmxy', label: '昆明学院' },
          { value: 'ynjj', label: '云南经济管理学院' },
          { value: 'kmmu2', label: '昆明医科大学海源学院' },
          { value: 'ynsf2', label: '云南师范大学商学院' },
          { value: 'ynys2', label: '云南艺术学院文华学院' },
          { value: 'kmust2', label: '昆明理工大学津桥学院' },
          { value: 'ynu2', label: '云南大学滇池学院' },
          { value: 'ynu3', label: '云南大学旅游文化学院' },
          { value: 'kmcs', label: '昆明城市学院' },
          { value: 'kmwl', label: '昆明文理学院' },
        ],
      },
      {
        value: 'dali',
        label: '大理市',
        children: [
          { value: 'dlu', label: '大理大学' },
        ],
      },
      {
        value: 'qujing',
        label: '曲靖市',
        children: [
          { value: 'qjsf', label: '曲靖师范学院' },
        ],
      },
      {
        value: 'yuxi',
        label: '玉溪市',
        children: [
          { value: 'yxsf', label: '玉溪师范学院' },
        ],
      },
      {
        value: 'zhaotong',
        label: '昭通市',
        children: [
          { value: 'ztxy', label: '昭通学院' },
        ],
      },
      {
        value: 'baoshan',
        label: '保山市',
        children: [
          { value: 'bsxy', label: '保山学院' },
        ],
      },
      {
        value: 'lincang',
        label: '临沧市',
        children: [
          { value: 'dxkj', label: '滇西科技师范学院' },
        ],
      },
      {
        value: 'chuxiong',
        label: '楚雄市',
        children: [
          { value: 'cxsf', label: '楚雄师范学院' },
        ],
      },
      {
        value: 'honghe',
        label: '红河州',
        children: [
          { value: 'hhxy', label: '红河学院' },
        ],
      },
      {
        value: 'wenshan',
        label: '文山州',
        children: [
          { value: 'wsxy', label: '文山学院' },
        ],
      },
      {
        value: 'puer',
        label: '普洱市',
        children: [
          { value: 'pexy', label: '普洱学院' },
        ],
      },
    ],
  },
  {
    value: 'guizhou',
    label: '贵州省',
    children: [
      {
        value: 'guiyang',
        label: '贵阳市',
        children: [
          { value: 'gzu', label: '贵州大学' },
          { value: 'gzmy', label: '贵州医科大学' },
          { value: 'gzzy', label: '贵州中医药大学' },
          { value: 'gzsf', label: '贵州师范大学' },
          { value: 'gzsf2', label: '贵州师范学院' },
          { value: 'gzcz', label: '贵州财经大学' },
          { value: 'gzmz', label: '贵州民族大学' },
          { value: 'gzsy', label: '贵州商学院' },
          { value: 'gzpc', label: '贵州警察学院' },
          { value: 'gyxy', label: '贵阳学院' },
          { value: 'gzlg', label: '贵州理工学院' },
          { value: 'gzzy2', label: '贵州中医药大学时珍学院' },
          { value: 'gzcz2', label: '贵州财经大学商务学院' },
          { value: 'gzu2', label: '贵州大学科技学院' },
          { value: 'gzmz2', label: '贵州民族大学人文科技学院' },
          { value: 'gzsf3', label: '贵州师范大学求是学院' },
          { value: 'gzmy2', label: '贵州医科大学神奇民族医药学院' },
          { value: 'gzsf4', label: '贵州师范学院求是学院' },
        ],
      },
      {
        value: 'zunyi',
        label: '遵义市',
        children: [
          { value: 'zymy', label: '遵义医科大学' },
          { value: 'zysf', label: '遵义师范学院' },
          { value: 'zymy2', label: '遵义医科大学医学与科技学院' },
        ],
      },
      {
        value: 'tongren',
        label: '铜仁市',
        children: [
          { value: 'trxy', label: '铜仁学院' },
        ],
      },
      {
        value: 'xingyi',
        label: '兴义市',
        children: [
          { value: 'xymz', label: '兴义民族师范学院' },
        ],
      },
      {
        value: 'anshun',
        label: '安顺市',
        children: [
          { value: 'asxy', label: '安顺学院' },
        ],
      },
      {
        value: 'bijie',
        label: '毕节市',
        children: [
          { value: 'gzgc', label: '贵州工程应用技术学院' },
        ],
      },
      {
        value: 'kaili',
        label: '凯里市',
        children: [
          { value: 'klxy', label: '凯里学院' },
        ],
      },
      {
        value: 'duyun',
        label: '都匀市',
        children: [
          { value: 'qnmz', label: '黔南民族师范学院' },
        ],
      },
      {
        value: 'liupanshui',
        label: '六盘水市',
        children: [
          { value: 'lpssf', label: '六盘水师范学院' },
        ],
      },
    ],
  },
  {
    value: 'xinjiang',
    label: '新疆维吾尔自治区',
    children: [
      {
        value: 'urumqi',
        label: '乌鲁木齐市',
        children: [
          { value: 'xju', label: '新疆大学' },
        ],
      },
    ],
  },
  {
    value: 'tianjin',
    label: '天津市',
    children: [
      { value: 'nankai', label: '南开大学' },
      { value: 'tju', label: '天津大学' },
      { value: 'tust', label: '天津科技大学' },
      { value: 'tjut', label: '天津工业大学' },
      { value: 'cauc', label: '中国民航大学' },
      { value: 'tjut2', label: '天津理工大学' },
      { value: 'tjny', label: '天津农学院' },
      { value: 'tmu', label: '天津医科大学' },
      { value: 'tjutcm', label: '天津中医药大学' },
      { value: 'tjnu', label: '天津师范大学' },
      { value: 'tjzy', label: '天津职业技术师范大学' },
      { value: 'tjwy', label: '天津外国语大学' },
      { value: 'tjcm', label: '天津商业大学' },
      { value: 'tjufe', label: '天津财经大学' },
      { value: 'tjty', label: '天津体育学院' },
      { value: 'tjcm2', label: '天津音乐学院' },
      { value: 'tjms', label: '天津美术学院' },
      { value: 'tjcj', label: '天津城建大学' },
      { value: 'tjts', label: '天津天狮学院' },
      { value: 'tjzd', label: '天津中德应用技术大学' },
      { value: 'tjwy2', label: '天津外国语大学滨海外事学院' },
      { value: 'tjcm3', label: '天津商业大学宝德学院' },
      { value: 'tmu2', label: '天津医科大学临床医学院' },
      { value: 'nankai2', label: '南开大学滨海学院' },
      { value: 'tjnu2', label: '天津师范大学津沽学院' },
      { value: 'tjut3', label: '天津理工大学中环信息学院' },
      { value: 'tjufe2', label: '天津财经大学珠江学院' },
      { value: 'tjra', label: '天津仁爱学院' },
      { value: 'tjty2', label: '天津体育学院运动与文化艺术学院' },
      { value: 'tjcm4', label: '天津传媒学院' },
    ],
  },
  {
    value: 'chongqing',
    label: '重庆市',
    children: [
      { value: 'cqu', label: '重庆大学' },
      { value: 'cqupt', label: '重庆邮电大学' },
      { value: 'cqjtu', label: '重庆交通大学' },
      { value: 'cqmu', label: '重庆医科大学' },
      { value: 'swu', label: '西南大学' },
      { value: 'cqnu', label: '重庆师范大学' },
      { value: 'cqwl', label: '重庆文理学院' },
      { value: 'cqss', label: '重庆三峡学院' },
      { value: 'cjnu', label: '长江师范学院' },
      { value: 'sisu', label: '四川外国语大学' },
      { value: 'swupl', label: '西南政法大学' },
      { value: 'scfa2', label: '四川美术学院' },
      { value: 'cqkj', label: '重庆科技学院' },
      { value: 'cqut', label: '重庆理工大学' },
      { value: 'cqgs', label: '重庆工商大学' },
      { value: 'cqpc', label: '重庆警察学院' },
      { value: 'cqdesf', label: '重庆第二师范学院' },
      { value: 'cqzy', label: '重庆中医药学院' },
      { value: 'cqgy', label: '重庆工业职业技术大学' },
      { value: 'cqjd', label: '重庆机电职业技术大学' },
      { value: 'cqgc', label: '重庆工程学院' },
      { value: 'cqcs', label: '重庆城市科技学院' },
      { value: 'cqrm', label: '重庆人文科技学院' },
      { value: 'cqwy', label: '重庆外语外事学院' },
      { value: 'cqdw', label: '重庆对外经贸学院' },
      { value: 'cqcj', label: '重庆财经学院' },
      { value: 'cqgs2', label: '重庆工商大学派斯学院' },
      { value: 'cqyt', label: '重庆移通学院' },
    ],
  },
  {
    value: 'guangxi',
    label: '广西壮族自治区',
    children: [
      {
        value: 'nanning',
        label: '南宁市',
        children: [
          { value: 'gxu', label: '广西大学' },
          { value: 'gxkj', label: '广西科技大学' },
          { value: 'gxmy', label: '广西医科大学' },
          { value: 'gxzy', label: '广西中医药大学' },
          { value: 'nnsf', label: '南宁师范大学' },
          { value: 'gxmz', label: '广西民族师范学院' },
          { value: 'gxcz', label: '广西财经学院' },
          { value: 'gxys', label: '广西艺术学院' },
          { value: 'gxmz2', label: '广西民族大学' },
          { value: 'gxkj2', label: '广西科技师范学院' },
          { value: 'gxpc', label: '广西警察学院' },
          { value: 'gxny', label: '广西农业职业技术大学' },
          { value: 'gxwy', label: '广西外国语学院' },
        ],
      },
      {
        value: 'guilin',
        label: '桂林市',
        children: [
          { value: 'guet', label: '桂林电子科技大学' },
          { value: 'glut', label: '桂林理工大学' },
          { value: 'gxsf', label: '广西师范大学' },
          { value: 'gxmy2', label: '桂林医学院' },
          { value: 'glht', label: '桂林航天工业学院' },
          { value: 'glly', label: '桂林旅游学院' },
        ],
      },
      {
        value: 'liuzhou',
        label: '柳州市',
        children: [
          { value: 'gxkj', label: '广西科技大学' },
          { value: 'lzzy', label: '柳州职业技术大学' },
        ],
      },
      {
        value: 'wuzhou',
        label: '梧州市',
        children: [
          { value: 'wzxy', label: '梧州学院' },
        ],
      },
      {
        value: 'beihai',
        label: '北海市',
        children: [
          { value: 'bbw', label: '北部湾大学' },
        ],
      },
      {
        value: 'fangchenggang',
        label: '防城港市',
        children: [
          { value: 'fcgxy', label: '防城港学院' },
        ],
      },
      {
        value: 'qinzhou',
        label: '钦州市',
        children: [
          { value: 'qzxy', label: '钦州学院' },
        ],
      },
      {
        value: 'guigang',
        label: '贵港市',
        children: [
          { value: 'ggxy', label: '贵港学院' },
        ],
      },
      {
        value: 'yulin2',
        label: '玉林市',
        children: [
          { value: 'ylsf', label: '玉林师范学院' },
        ],
      },
      {
        value: 'baise',
        label: '百色市',
        children: [
          { value: 'bsxy', label: '百色学院' },
        ],
      },
      {
        value: 'hechi',
        label: '河池市',
        children: [
          { value: 'hcxy', label: '河池学院' },
        ],
      },
      {
        value: 'hezhou',
        label: '贺州市',
        children: [
          { value: 'hzxy', label: '贺州学院' },
        ],
      },
      {
        value: 'laibin',
        label: '来宾市',
        children: [
          { value: 'lbxy', label: '来宾学院' },
        ],
      },
      {
        value: 'chongzuo',
        label: '崇左市',
        children: [
          { value: 'czxy', label: '崇左学院' },
        ],
      },
    ],
  },
  {
    value: 'hainan',
    label: '海南省',
    children: [
      {
        value: 'haikou',
        label: '海口市',
        children: [
          { value: 'hainu', label: '海南大学' },
          { value: 'hnsf', label: '海南师范大学' },
          { value: 'hnmy', label: '海南医科大学' },
          { value: 'qtsf', label: '琼台师范学院' },
          { value: 'hnpc', label: '海南警察学院' },
          { value: 'hkj', label: '海口经济学院' },
          { value: 'hnkj', label: '海南科技职业大学' },
        ],
      },
      {
        value: 'sanya',
        label: '三亚市',
        children: [
          { value: 'hnrd', label: '海南热带海洋学院' },
          { value: 'syxy', label: '三亚学院' },
        ],
      },
      {
        value: 'lingshui',
        label: '陵水县',
        children: [
          { value: 'hnbl', label: '海南比勒费尔德应用科学大学' },
        ],
      },
    ],
  },
  {
    value: 'gansu',
    label: '甘肃省',
    children: [
      {
        value: 'lanzhou',
        label: '兰州市',
        children: [
          { value: 'lzu', label: '兰州大学' },
          { value: 'lzlg', label: '兰州理工大学' },
          { value: 'lzjtu', label: '兰州交通大学' },
          { value: 'gsny', label: '甘肃农业大学' },
          { value: 'gszy', label: '甘肃中医药大学' },
          { value: 'nwnu', label: '西北师范大学' },
          { value: 'lzcs', label: '兰州城市学院' },
          { value: 'gscz', label: '兰州财经大学' },
          { value: 'xbmz', label: '西北民族大学' },
          { value: 'gszf', label: '甘肃政法大学' },
          { value: 'gsmz', label: '甘肃民族师范学院' },
          { value: 'lzwl', label: '兰州文理学院' },
          { value: 'gsmy', label: '甘肃医学院' },
          { value: 'lzgy', label: '兰州工业学院' },
          { value: 'lzxx', label: '兰州信息科技学院' },
          { value: 'lzgs', label: '兰州工商学院' },
          { value: 'lzbw', label: '兰州博文科技学院' },
        ],
      },
      {
        value: 'tianshui',
        label: '天水市',
        children: [
          { value: 'tssf', label: '天水师范学院' },
        ],
      },
      {
        value: 'qingyang',
        label: '庆阳市',
        children: [
          { value: 'ldxy', label: '陇东学院' },
        ],
      },
      {
        value: 'zhangye',
        label: '张掖市',
        children: [
          { value: 'hxxy', label: '河西学院' },
        ],
      },
      {
        value: 'wuwei',
        label: '武威市',
        children: [
          { value: 'wwxy', label: '武威学院' },
        ],
      },
      {
        value: 'jiayuguan',
        label: '嘉峪关市',
        children: [
          { value: 'jygxy', label: '嘉峪关学院' },
        ],
      },
      {
        value: 'jinchang',
        label: '金昌市',
        children: [
          { value: 'jcxy', label: '金昌学院' },
        ],
      },
      {
        value: 'baiyin',
        label: '白银市',
        children: [
          { value: 'byxy', label: '白银学院' },
        ],
      },
      {
        value: 'pingliang',
        label: '平凉市',
        children: [
          { value: 'plxy', label: '平凉学院' },
        ],
      },
      {
        value: 'jiuquan',
        label: '酒泉市',
        children: [
          { value: 'jqxy', label: '酒泉学院' },
        ],
      },
      {
        value: 'dingxi',
        label: '定西市',
        children: [
          { value: 'dxxy', label: '定西学院' },
        ],
      },
      {
        value: 'longnan',
        label: '陇南市',
        children: [
          { value: 'lnxy', label: '陇南学院' },
        ],
      },
      {
        value: 'linxia',
        label: '临夏州',
        children: [
          { value: 'lxxy', label: '临夏学院' },
        ],
      },
      {
        value: 'gannan',
        label: '甘南州',
        children: [
          { value: 'gsmz', label: '甘肃民族师范学院' },
        ],
      },
    ],
  },
  {
    value: 'ningxia',
    label: '宁夏回族自治区',
    children: [
      {
        value: 'yinchuan',
        label: '银川市',
        children: [
          { value: 'nxu', label: '宁夏大学' },
          { value: 'nxmy', label: '宁夏医科大学' },
          { value: 'bfmz', label: '北方民族大学' },
          { value: 'nxzy', label: '宁夏职业技术大学' },
          { value: 'nxgs', label: '宁夏工商职业技术大学' },
          { value: 'nxu2', label: '宁夏大学新华学院' },
          { value: 'ycnl', label: '银川能源学院' },
          { value: 'yckj', label: '银川科技学院' },
        ],
      },
      {
        value: 'guyuan',
        label: '固原市',
        children: [
          { value: 'nxsf', label: '宁夏师范大学' },
        ],
      },
      {
        value: 'shizuishan',
        label: '石嘴山市',
        children: [
          { value: 'nxlg', label: '宁夏理工学院' },
        ],
      },
    ],
  },
  {
    value: 'qinghai',
    label: '青海省',
    children: [
      {
        value: 'xining',
        label: '西宁市',
        children: [
          { value: 'qhu', label: '青海大学' },
          { value: 'qhsf', label: '青海师范大学' },
          { value: 'qhmz', label: '青海民族大学' },
          { value: 'qhzy', label: '青海职业技术大学' },
          { value: 'qhlg', label: '青海理工学院' },
          { value: 'qhu2', label: '青海大学昆仑学院' },
        ],
      },
    ],
  },
  {
    value: 'tibet',
    label: '西藏自治区',
    children: [
      {
        value: 'lasa',
        label: '拉萨市',
        children: [
          { value: 'tibet', label: '西藏大学' },
          { value: 'xzzy', label: '西藏藏医药大学' },
          { value: 'lssf', label: '拉萨师范学院' },
        ],
      },
      {
        value: 'linzhi',
        label: '林芝市',
        children: [
          { value: 'xznm', label: '西藏农牧大学' },
        ],
      },
      {
        value: 'xianyang2',
        label: '咸阳市',
        children: [
          { value: 'xzmz', label: '西藏民族大学' },
        ],
      },
    ],
  },
  {
    value: 'neimenggu',
    label: '内蒙古自治区',
    children: [
      {
        value: 'hohhot',
        label: '呼和浩特市',
        children: [
          { value: 'imau', label: '内蒙古大学' },
          { value: 'imust', label: '内蒙古科技大学' },
          { value: 'imgd', label: '内蒙古工业大学' },
          { value: 'imny', label: '内蒙古农业大学' },
          { value: 'immy', label: '内蒙古医科大学' },
          { value: 'imsf', label: '内蒙古师范大学' },
          { value: 'hhmz', label: '呼和浩特民族学院' },
          { value: 'imcz', label: '内蒙古财经大学' },
          { value: 'imys', label: '内蒙古艺术学院' },
          { value: 'imhd', label: '内蒙古鸿德文理学院' },
          { value: 'imau2', label: '内蒙古大学创业学院' },
        ],
      },
      {
        value: 'baotou',
        label: '包头市',
        children: [
          { value: 'imust', label: '内蒙古科技大学' },
        ],
      },
      {
        value: 'wuhai',
        label: '乌海市',
        children: [
          { value: 'whxy', label: '乌海学院' },
        ],
      },
      {
        value: 'chifeng',
        label: '赤峰市',
        children: [
          { value: 'cfxy', label: '赤峰学院' },
        ],
      },
      {
        value: 'tongliao',
        label: '通辽市',
        children: [
          { value: 'immz', label: '内蒙古民族大学' },
        ],
      },
      {
        value: 'eerduosi',
        label: '鄂尔多斯市',
        children: [
          { value: 'eedsyy', label: '鄂尔多斯应用技术学院' },
        ],
      },
      {
        value: 'hulunbeier',
        label: '呼伦贝尔市',
        children: [
          { value: 'hlbexy', label: '呼伦贝尔学院' },
        ],
      },
      {
        value: 'bayannaoer',
        label: '巴彦淖尔市',
        children: [
          { value: 'htxy', label: '河套学院' },
        ],
      },
      {
        value: 'ulanchabu',
        label: '乌兰察布市',
        children: [
          { value: 'jnsf', label: '集宁师范学院' },
        ],
      },
    ],
  },
]
