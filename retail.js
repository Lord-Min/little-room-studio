const retailModels = {
  bed: [
    ["이케아 슬라툼 쿠션형 침대프레임 1240", 1240, 2060, 850, "https://www.ikea.com/kr/ko/p/slattum-upholstered-bed-frame-vissle-dark-grey-70571242/", "padded"],
    ["이케아 말름 높은침대프레임 1350", 1350, 2090, 1000, "https://www.ikea.com/kr/ko/p/malm-bed-frame-high-white-loenset-s69019587/", "panel"],
    ["이케아 타르바 침대프레임 1280", 1280, 2090, 920, "https://www.ikea.com/kr/ko/p/tarva-bed-frame-pine-00354459/", "slats"],
    ["이케아 슬렉트 침대프레임+수납/갈빗살 960", 960, 2060, 890, "https://www.ikea.com/kr/ko/p/slaekt-bed-frame-w-storage-slatted-bedbase-white-s99291967/", "storage"],
    ["이케아 브림네스 수납침대프레임 1260", 1260, 2060, 470, "https://www.ikea.com/kr/ko/p/brimnes-bed-frame-with-storage-white-50401043/", "lowdrawers"],
    ["이케아 브림네스 데이베드프레임+서랍2 870", 870, 2050, 580, "https://www.ikea.com/kr/ko/p/brimnes-day-bed-frame-with-2-drawers-white-30503655/", "daybed"]
  ],
  desk: [
    ["이케아 린몬·아딜스 테이블 1000", 1000, 600, 740, "https://www.ikea.com/kr/ko/p/linnmon-adils-table-white-s09246408/", "plain"],
    ["이케아 락캅텐·아딜스 책상 1200", 1200, 600, 730, "https://www.ikea.com/kr/ko/p/lagkapten-adils-desk-white-s09416759/", "plain"],
    ["이케아 미케 책상 730", 730, 500, 750, "https://www.ikea.com/kr/ko/p/micke-desk-white-80354281/", "drawer"],
    ["이케아 미케 책상 1050", 1050, 500, 750, "https://www.ikea.com/kr/ko/p/micke-desk-white-80354276/", "cabinet"],
    ["이케아 락캅텐·알렉스 책상 1200", 1200, 600, 730, "https://www.ikea.com/kr/ko/p/lagkapten-alex-desk-white-s09416820/", "pedestal"],
    ["이케아 토랄드 책상 650", 650, 400, 750, "https://www.ikea.com/kr/ko/p/torald-desk-white-70493956/", "sides"]
  ],
  wardrobe: [
    ["이케아 클렙스타드 옷장+도어3 1170", 1170, 550, 1760, "https://www.ikea.com/kr/ko/p/kleppstad-wardrobe-with-3-doors-white-80441759/", "three"],
    ["이케아 클렙스타드 슬라이딩도어옷장 1170", 1170, 550, 1760, "https://www.ikea.com/kr/ko/p/kleppstad-wardrobe-with-sliding-doors-white-30437241/", "slide"],
    ["이케아 클렙스타드 옷장+도어2 790", 790, 550, 1760, "https://www.ikea.com/kr/ko/p/kleppstad-wardrobe-with-2-doors-white-10437237/", "two"],
    ["이케아 브림네스 옷장+도어3 1170", 1170, 500, 1900, "https://www.ikea.com/kr/ko/p/brimnes-wardrobe-with-3-doors-white-10407928/", "mirror"],
    ["이케아 구르스켄 옷장 494", 494, 550, 1857, "https://www.ikea.com/kr/ko/p/gursken-wardrobe-light-beige-50503292/", "one"],
    ["이케아 브림네스 옷장+도어2 780", 780, 500, 1900, "https://www.ikea.com/kr/ko/p/brimnes-wardrobe-with-2-doors-white-20400479/", "two"]
  ],
  shelf: [
    ["이케아 빌리 책장 800", 800, 280, 2020, "https://www.ikea.com/kr/ko/p/billy-bookcase-white-00522047/", "six"],
    ["이케아 빌리 책장 800", 800, 280, 1060, "https://www.ikea.com/kr/ko/p/billy-bookcase-white-70522044/", "three"],
    ["이케아 빌리 책장 400", 400, 280, 2020, "https://www.ikea.com/kr/ko/p/billy-bookcase-white-30522041/", "six"],
    ["이케아 바게보 책장 500", 500, 250, 1600, "https://www.ikea.com/kr/ko/p/baggebo-bookcase-white-10483880/", "four"],
    ["이케아 바게보 책장 500", 500, 300, 800, "https://www.ikea.com/kr/ko/p/baggebo-bookcase-white-10483875/", "two"],
    ["이케아 라이바 책장 620", 620, 240, 1650, "https://www.ikea.com/kr/ko/p/laiva-bookcase-black-brown-20178592/", "five"]
  ],
  vanity: [
    ["이케아 브림네스 화장대 700", 700, 420, 770, "https://www.ikea.com/kr/ko/p/brimnes-dressing-table-white-90355421/", "flip"],
    ["이케아 그로피엘레트 화장대 1000", 1000, 420, 1350, "https://www.ikea.com/kr/ko/p/grafjaellet-dressing-table-white-40583109/", "mirror"],
    ["이케아 쉬브데 화장대 1003", 1003, 482, 780, "https://www.ikea.com/kr/ko/p/syvde-dressing-table-white-00439562/", "cabinet"],
    ["이케아 말름 화장대 1200", 1200, 410, 780, "https://www.ikea.com/kr/ko/p/malm-dressing-table-white-40355409/", "sides"],
    ["이케아 헴네스 거울화장대 1000", 1000, 500, 1590, "https://www.ikea.com/kr/ko/p/hemnes-dressing-table-white-10355670/", "mirror"],
    ["이케아 노르드키사 화장대 760", 760, 470, 760, "https://www.ikea.com/kr/ko/p/nordkisa-dressing-table-bamboo-00439473/", "bamboo"]
  ]
};
