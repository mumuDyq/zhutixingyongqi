
// 创建类型别名
export type StarType = typeof StarType[keyof typeof StarType];
export type StarElement = typeof StarElement[keyof typeof StarElement];


/**
 * 紫微斗数核心数据结构定义
 * 包含宫位和星耀的定义，以及相关工具函数
 */

// 宫位数据接口
export interface PalaceData {
  id: string;              // 唯一标识符
  name: string;            // 宫位名称
  x: number;               // X坐标
  z: number;               // Z坐标
  color?: number;          // 宫位颜色
  description?: string;    // 宫位描述
}

// 星耀数据接口
export interface StarData {
  id: string;              // 唯一标识符
  name: string;            // 星耀名称
  color?: number;          // 星耀颜色
  type: StarType;          // 星耀类型
  description?: string;    // 星耀描述
  element?: StarElement;   // 星耀五行属性
}

// 星耀类型枚举
export const StarType = {
  MAJOR: 'major',           // 主星
  FOURCHANGE: 'fourchange', // 四化星
  YIJIFUXING: 'yijifuxing', // 乙级辅星
  SIXYAO: 'sixyao',        // 六煞星
  BINGDINGWUJI: 'bingdingwuji', // 丙丁戊级辅星及杂曜
  TECHNICAL: 'technical'    // 技术星/专业星
} as const;


// 星耀五行属性枚举
export const StarElement = {
  YIN: 'yin',
  YANG: 'yang',
  WOOD: 'wood',
  FIRE: 'fire',
  EARTH: 'earth',
  METAL: 'metal',
  WATER: 'water'
} as const;


/**
 * 宫位数据管理器
 */
export class PalaceDataManager {
  private palaces: Map<string, PalaceData> = new Map();

  constructor() {
    this.initializePalaces();
  }

  /**
   * 初始化所有宫位数据
   */
  private initializePalaces(): void {
    // 按照实际命盘布局顺序排列的宫位
    const palaceData: PalaceData[] = [
      // 上方三宫（从左到右）
      { id: 'palace_fumu', name: '父母', x: -6, z: 6, color: 0x4B0082 },
      { id: 'palace_fude', name: '福德', x: -2, z: 6, color: 0x4B0082 },
      { id: 'palace_tianzhai', name: '田宅', x: 2, z: 6, color: 0x4B0082 },

      // 右侧三宫（从上到下）
      { id: 'palace_guanlu', name: '官禄', x: 6, z: 6, color: 0x8B0000 },
      { id: 'palace_youji', name: '交友', x: 6, z: 2, color: 0x006400 },
      { id: 'palace_qianyi', name: '迁移', x: 6, z: -2, color: 0x00008B },

      // 下方三宫（从右到左）
      { id: 'palace_jie', name: '疾厄', x: 6, z: -6, color: 0x006400 },
      { id: 'palace_caibo', name: '财帛', x: 2, z: -6, color: 0x8B0000 },
      { id: 'palace_zinv', name: '子女', x: -2, z: -6, color: 0x00008B },

      // 左侧三宫（从下到上）
      { id: 'palace_fuqi', name: '夫妻', x: -6, z: -6, color: 0x00008B },
      { id: 'palace_xiongdi', name: '兄弟', x: -6, z: -2, color: 0x006400 },
      { id: 'palace_minggong', name: '命宫', x: -6, z: 2, color: 0x8B0000 }
    ];

    // 添加到映射中
    palaceData.forEach(palace => {
      this.palaces.set(palace.id, palace);
    });
  }

  /**
   * 根据ID获取宫位数据
   */
  public getPalaceById(id: string): PalaceData | undefined {
    return this.palaces.get(id);
  }

  /**
   * 根据名称获取宫位数据
   */
  public getPalaceByName(name: string): PalaceData | undefined {
    for (const palace of this.palaces.values()) {
      if (palace.name === name) {
        return palace;
      }
    }
    return undefined;
  }

  /**
   * 获取所有宫位数据
   */
  public getAllPalaces(): PalaceData[] {
    return Array.from(this.palaces.values());
  }

  /**
   * 获取所有宫位名称
   */
  public getPalaceNames(): string[] {
    return Array.from(this.palaces.values()).map(palace => palace.name);
  }
}

/**
 * 星耀数据管理器
 */
export class StarDataManager {
  private stars: Map<string, StarData> = new Map();

  constructor() {
    this.initializeStars();
  }

  /**
   * 初始化所有星耀数据
   */
  private initializeStars(): void {
    // 一、主星（14颗）
    const majorStars: StarData[] = [
      // 紫微星系（6颗）
      { id: 'star_ziwei', name: '紫微', type: StarType.MAJOR, color: 0xFFD700, element: StarElement.YIN },
      { id: 'star_tianji', name: '天机', type: StarType.MAJOR, color: 0x87CEEB, element: StarElement.YIN },
      { id: 'star_taiyang', name: '太阳', type: StarType.MAJOR, color: 0xFF8C00, element: StarElement.YANG },
      { id: 'star_wuqu', name: '武曲', type: StarType.MAJOR, color: 0x4169E1, element: StarElement.YANG },
      { id: 'star_tianxiong', name: '天同', type: StarType.MAJOR, color: 0xFFB6C1, element: StarElement.YANG },
      { id: 'star_lianzhen', name: '廉贞', type: StarType.MAJOR, color: 0x8B0000, element: StarElement.YIN },
      
      // 天府星系（8颗）
      { id: 'star_tianfu', name: '天府', type: StarType.MAJOR, color: 0x32CD32, element: StarElement.YANG },
      { id: 'star_taiyin', name: '太阴', type: StarType.MAJOR, color: 0xE6E6FA, element: StarElement.YIN },
      { id: 'star_tanlang', name: '贪狼', type: StarType.MAJOR, color: 0x008000, element: StarElement.YANG },
      { id: 'star_jumen', name: '巨门', type: StarType.MAJOR, color: 0x696969, element: StarElement.YIN },
      { id: 'star_tianxiang', name: '天相', type: StarType.MAJOR, color: 0xFF6347, element: StarElement.YANG },
      { id: 'star_tianliang', name: '天梁', type: StarType.MAJOR, color: 0x8B4513, element: StarElement.YANG },
      { id: 'star_qisha', name: '七杀', type: StarType.MAJOR, color: 0x8B0000, element: StarElement.YANG },
      { id: 'star_pojun', name: '破军', type: StarType.MAJOR, color: 0x800080, element: StarElement.YANG }
    ];

    // 二、四化星（4颗）
    const fourChangeStars: StarData[] = [
      { id: 'star_hualu', name: '化禄', type: StarType.FOURCHANGE, color: 0x32CD32, element: StarElement.YANG },
      { id: 'star_huaquan', name: '化权', type: StarType.FOURCHANGE, color: 0xFFD700, element: StarElement.YANG },
      { id: 'star_huake', name: '化科', type: StarType.FOURCHANGE, color: 0x00BFFF, element: StarElement.YIN },
      { id: 'star_huaji', name: '化忌', type: StarType.FOURCHANGE, color: 0x800080, element: StarElement.YIN }
    ];

    // 三、乙级辅星（18颗）
    const yijiFuxingStars: StarData[] = [
      // 吉星/中性星
      { id: 'star_zuofu', name: '左辅', type: StarType.YIJIFUXING, color: 0xFFD700, element: StarElement.YANG },
      { id: 'star_youbi', name: '右弼', type: StarType.YIJIFUXING, color: 0xFFD700, element: StarElement.YIN },
      { id: 'star_tiankui', name: '天魁', type: StarType.YIJIFUXING, color: 0xFF4500, element: StarElement.YANG },
      { id: 'star_tianyue', name: '天钺', type: StarType.YIJIFUXING, color: 0xFF4500, element: StarElement.YIN },
      { id: 'star_wenchang', name: '文昌', type: StarType.YIJIFUXING, color: 0x00BFFF, element: StarElement.YIN },
      { id: 'star_wenqu', name: '文曲', type: StarType.YIJIFUXING, color: 0x4169E1, element: StarElement.YIN },
      { id: 'star_luzhen', name: '禄存', type: StarType.YIJIFUXING, color: 0xFFD700, element: StarElement.YIN },
      { id: 'star_tianma', name: '天马', type: StarType.YIJIFUXING, color: 0xFF4500, element: StarElement.YANG },
      
      // 煞星/杂曜
      { id: 'star_qingyang', name: '擎羊', type: StarType.YIJIFUXING, color: 0xFF0000, element: StarElement.YANG },
      { id: 'star_tuoluo', name: '陀罗', type: StarType.YIJIFUXING, color: 0x800080, element: StarElement.YIN },
      { id: 'star_huoxing', name: '火星', type: StarType.YIJIFUXING, color: 0xFF0000, element: StarElement.YANG },
      { id: 'star_lingxing', name: '铃星', type: StarType.YIJIFUXING, color: 0x800080, element: StarElement.YIN },
      { id: 'star_disha', name: '地空', type: StarType.YIJIFUXING, color: 0x87CEEB, element: StarElement.YANG },
      { id: 'star_dijie', name: '地劫', type: StarType.YIJIFUXING, color: 0x800080, element: StarElement.YIN },
      
      // 特殊辅星
      { id: 'star_tianguan', name: '天官', type: StarType.YIJIFUXING, color: 0x32CD32, element: StarElement.YANG },
      { id: 'star_tianfu', name: '天福', type: StarType.YIJIFUXING, color: 0xFF6347, element: StarElement.YANG },
      { id: 'star_tianchu', name: '天厨', type: StarType.YIJIFUXING, color: 0xFFD700, element: StarElement.YANG },
      { id: 'star_engguang', name: '恩光', type: StarType.YIJIFUXING, color: 0xFFD700, element: StarElement.YANG },
      { id: 'star_tiangu', name: '天贵', type: StarType.YIJIFUXING, color: 0xFFD700, element: StarElement.YANG }
    ];

    // 四、六煞星（6颗）
    const sixyaoStars: StarData[] = [
      { id: 'star_qingyang', name: '擎羊', type: StarType.SIXYAO, color: 0xFF0000, element: StarElement.YANG },
      { id: 'star_tuoluo', name: '陀罗', type: StarType.SIXYAO, color: 0x800080, element: StarElement.YIN },
      { id: 'star_huoxing', name: '火星', type: StarType.SIXYAO, color: 0xFF0000, element: StarElement.YANG },
      { id: 'star_lingxing', name: '铃星', type: StarType.SIXYAO, color: 0x800080, element: StarElement.YIN },
      { id: 'star_disha', name: '地空', type: StarType.SIXYAO, color: 0x87CEEB, element: StarElement.YANG },
      { id: 'star_dijie', name: '地劫', type: StarType.SIXYAO, color: 0x800080, element: StarElement.YIN }
    ];

    // 五、丙丁戊级辅星及杂曜（34颗）
    const bingdingwujiStars: StarData[] = [
      // 丙级星（部分常见）
      { id: 'star_hongluan', name: '红鸾', type: StarType.BINGDINGWUJI, color: 0xFF69B4, element: StarElement.YIN },
      { id: 'star_tianxi', name: '天喜', type: StarType.BINGDINGWUJI, color: 0xFF1493, element: StarElement.YANG },
      { id: 'star_xianchi', name: '咸池', type: StarType.BINGDINGWUJI, color: 0xFF1493, element: StarElement.YIN },
      { id: 'star_dahao', name: '大耗', type: StarType.BINGDINGWUJI, color: 0x696969, element: StarElement.YIN },
      { id: 'star_tiande', name: '天德', type: StarType.BINGDINGWUJI, color: 0x32CD32, element: StarElement.YANG },
      { id: 'star_yuede', name: '月德', type: StarType.BINGDINGWUJI, color: 0xE6E6FA, element: StarElement.YIN },
      { id: 'star_longchi', name: '龙池', type: StarType.BINGDINGWUJI, color: 0x00CED1, element: StarElement.YANG },
      { id: 'star_fengge', name: '凤阁', type: StarType.BINGDINGWUJI, color: 0xFF1493, element: StarElement.YIN },
      { id: 'star_tiancai', name: '天才', type: StarType.BINGDINGWUJI, color: 0x00BFFF, element: StarElement.YIN },
      { id: 'star_tianshou', name: '天寿', type: StarType.BINGDINGWUJI, color: 0x32CD32, element: StarElement.YANG },
      { id: 'star_santai', name: '三台', type: StarType.BINGDINGWUJI, color: 0x4682B4, element: StarElement.YANG },
      { id: 'star_bazuo', name: '八座', type: StarType.BINGDINGWUJI, color: 0x4682B4, element: StarElement.YIN },
      { id: 'star_tianxing', name: '天刑', type: StarType.BINGDINGWUJI, color: 0x8B0000, element: StarElement.YANG },
      { id: 'star_tianyao', name: '天姚', type: StarType.BINGDINGWUJI, color: 0xFF69B4, element: StarElement.YIN },
      { id: 'star_jieshen', name: '解神', type: StarType.BINGDINGWUJI, color: 0x87CEEB, element: StarElement.YIN },
      { id: 'star_tianwu', name: '天巫', type: StarType.BINGDINGWUJI, color: 0x9370DB, element: StarElement.YIN },
      { id: 'star_tianyue', name: '天月', type: StarType.BINGDINGWUJI, color: 0xE6E6FA, element: StarElement.YIN },
      { id: 'star_yinsha', name: '阴煞', type: StarType.BINGDINGWUJI, color: 0x696969, element: StarElement.YIN },
      { id: 'star_guxian', name: '孤辰', type: StarType.BINGDINGWUJI, color: 0x696969, element: StarElement.YANG },
      { id: 'star_gua', name: '寡宿', type: StarType.BINGDINGWUJI, color: 0x696969, element: StarElement.YIN },
      { id: 'star_jiesha', name: '劫煞', type: StarType.BINGDINGWUJI, color: 0x800080, element: StarElement.YIN },
      { id: 'star_huagai', name: '华盖', type: StarType.BINGDINGWUJI, color: 0x4169E1, element: StarElement.YANG },
      { id: 'star_posui', name: '破碎', type: StarType.BINGDINGWUJI, color: 0x696969, element: StarElement.YIN },
      { id: 'star_feilian', name: '蜚廉', type: StarType.BINGDINGWUJI, color: 0x8B4513, element: StarElement.YANG },
      { id: 'star_tiankong', name: '天空', type: StarType.BINGDINGWUJI, color: 0x87CEEB, element: StarElement.YANG },
      { id: 'star_xunkong', name: '旬空', type: StarType.BINGDINGWUJI, color: 0xE0FFFF, element: StarElement.YIN },
      { id: 'star_jiekong', name: '截空', type: StarType.BINGDINGWUJI, color: 0xE0FFFF, element: StarElement.YIN },
      { id: 'star_tianku', name: '天哭', type: StarType.BINGDINGWUJI, color: 0x4682B4, element: StarElement.YIN },
      { id: 'star_tianxu', name: '天虚', type: StarType.BINGDINGWUJI, color: 0xE0FFFF, element: StarElement.YIN },
      { id: 'star_taifu', name: '台辅', type: StarType.BINGDINGWUJI, color: 0x32CD32, element: StarElement.YANG },
      { id: 'star_fenggao', name: '封诰', type: StarType.BINGDINGWUJI, color: 0xFFD700, element: StarElement.YANG },
      { id: 'star_tianshang', name: '天伤', type: StarType.BINGDINGWUJI, color: 0x800080, element: StarElement.YANG },
      { id: 'star_tianshi', name: '天使', type: StarType.BINGDINGWUJI, color: 0x800080, element: StarElement.YIN }
    ];

    // 六、技术星/专业星（12颗）
    const technicalStars: StarData[] = [
      { id: 'star_wenchang', name: '文昌', type: StarType.TECHNICAL, color: 0x00BFFF, element: StarElement.YIN, description: '学术' },
      { id: 'star_wenqu', name: '文曲', type: StarType.TECHNICAL, color: 0x4169E1, element: StarElement.YIN, description: '文艺' },
      { id: 'star_tianchu', name: '天厨', type: StarType.TECHNICAL, color: 0xFFD700, element: StarElement.YANG, description: '饮食' },
      { id: 'star_tiancai', name: '天才', type: StarType.TECHNICAL, color: 0x00BFFF, element: StarElement.YIN, description: '才智' },
      { id: 'star_longchi', name: '龙池', type: StarType.TECHNICAL, color: 0x00CED1, element: StarElement.YANG, description: '建筑音乐' },
      { id: 'star_fengge', name: '凤阁', type: StarType.TECHNICAL, color: 0xFF1493, element: StarElement.YIN, description: '设计美学' },
      { id: 'star_tianxing', name: '天刑', type: StarType.TECHNICAL, color: 0x8B0000, element: StarElement.YANG, description: '法律医疗' },
      { id: 'star_tianyao', name: '天姚', type: StarType.TECHNICAL, color: 0xFF69B4, element: StarElement.YIN, description: '艺术交际' },
      { id: 'star_jieshen', name: '解神', type: StarType.TECHNICAL, color: 0x87CEEB, element: StarElement.YIN, description: '医药化解' },
      { id: 'star_huagai', name: '华盖', type: StarType.TECHNICAL, color: 0x4169E1, element: StarElement.YANG, description: '哲学玄学' },
      { id: 'star_tianwu', name: '天巫', type: StarType.TECHNICAL, color: 0x9370DB, element: StarElement.YIN, description: '命理传承' },
      { id: 'star_taifu', name: '台辅', type: StarType.TECHNICAL, color: 0x32CD32, element: StarElement.YANG, description: '管理技术' },
      { id: 'star_fenggao', name: '封诰', type: StarType.TECHNICAL, color: 0xFFD700, element: StarElement.YANG, description: '管理技术' }
    ];

    // 将所有星耀添加到映射中
    [...majorStars, ...fourChangeStars, ...yijiFuxingStars, ...sixyaoStars, ...bingdingwujiStars, ...technicalStars].forEach(star => {
      this.stars.set(star.id, star);
    });
  }

  /**
   * 根据ID获取星耀数据
   */
  public getStarById(id: string): StarData | undefined {
    return this.stars.get(id);
  }

  /**
   * 根据名称获取星耀数据
   */
  public getStarByName(name: string): StarData | undefined {
    for (const star of this.stars.values()) {
      if (star.name === name) {
        return star;
      }
    }
    return undefined;
  }

  /**
   * 根据类型获取星耀列表
   */
  public getStarsByType(type: StarType): StarData[] {
    return Array.from(this.stars.values()).filter(star => star.type === type);
  }

  /**
   * 获取所有星耀数据
   */
  public getAllStars(): StarData[] {
    return Array.from(this.stars.values());
  }

  /**
   * 获取所有星耀名称
   */
  public getStarNames(): string[] {
    return Array.from(this.stars.values()).map(star => star.name);
  }
}

/**
 * 紫微斗数数据管理器
 * 统一管理宫位和星耀数据
 */
export class ZiWeiDataManager {
  private palaceManager: PalaceDataManager;
  private starManager: StarDataManager;

  constructor() {
    this.palaceManager = new PalaceDataManager();
    this.starManager = new StarDataManager();
  }

  /**
   * 获取宫位管理器
   */
  public getPalaceManager(): PalaceDataManager {
    return this.palaceManager;
  }

  /**
   * 获取星耀管理器
   */
  public getStarManager(): StarDataManager {
    return this.starManager;
  }

  /**
   * 根据宫位ID获取宫位数据
   */
  public getPalaceById(id: string): PalaceData | undefined {
    return this.palaceManager.getPalaceById(id);
  }

  /**
   * 根据宫位名称获取宫位数据
   */
  public getPalaceByName(name: string): PalaceData | undefined {
    return this.palaceManager.getPalaceByName(name);
  }

  /**
   * 根据星耀ID获取星耀数据
   */
  public getStarById(id: string): StarData | undefined {
    return this.starManager.getStarById(id);
  }

  /**
   * 根据星耀名称获取星耀数据
   */
  public getStarByName(name: string): StarData | undefined {
    return this.starManager.getStarByName(name);
  }

  /**
   * 根据类型获取星耀列表
   */
  public getStarsByType(type: StarType): StarData[] {
    return this.starManager.getStarsByType(type);
  }
}

// 导出全局数据管理器实例
export const ziWeiDataManager = new ZiWeiDataManager();
