import { ref } from 'vue';

export const locale = ref(localStorage.getItem('fcu_locale') || 'zh');

const messages = {
  zh: {
    nav: { report: '我要通報', track: '案件進度查詢', board: '通報看板', admin: '管理後台', switch: 'English' },
    home: {
      eyebrow: 'FCU Campus Repair & Cleaning Reporting System',
      title: '讓校園問題，被看見、被追蹤、被完成。',
      description: '快速通報地點相關的修繕、清潔與常見問題，透過案件編號追蹤處理進度。',
      reportNow: '立即通報', trackLabel: '輸入案件編號查詢進度', trackPlaceholder: 'R20260816XXXX', track: '查詢進度', loading: '查詢中…',
      reportNo: '案件編號', copy: '複製案件編號', copied: '已複製',
      errors: { emptyReportNo: '請輸入案件編號', trackFailed: '案件查詢失敗，請稍後再試', submitFailed: '送出失敗', locationFailed: '無法取得定位，仍可繼續送出', missingIdentifier: '請填寫學號／員工編號' },
      features: { photo: '圖片通報', photoText: '最多上傳五張現場照片。', map: '地圖定位', mapText: '記錄問題發生的位置座標。', search: '進度查詢', searchText: '輸入案件編號即可查看最新處理狀態。' }
    },
    status: { pending: '待處理', processing: '處理中', completed: '已完成', rejected: '已退件' },
    board: {
      title: '通報看板', keyword: '關鍵字', keywordPlaceholder: '案件編號、地點、說明', location: '地點', category: '問題分類', status: '狀態', all: '全部', search: '搜尋', none: '目前沒有符合條件的案件', total: '共 {count} 筆'
    },
    dashboard: {
      title: '管理 Dashboard', realtime: '即時案件概況', data: '資料管理', accounts: '帳號管理', logout: '登出', today: '今日通報', viewAllCases: '查看全部案件', pending: '待處理', pendingList: '點擊看待處理清單', processing: '處理中', processingList: '點擊看處理中清單', completed: '已完成', completedList: '點擊看已完成清單', average: '平均處理時間', basedOnCompleted: '依已完成案件計算', category: '問題分類', categoryHint: '看出哪一類問題最常發生', building: '地點案件分布', buildingHint: '看出問題集中在哪些建物', latest: '最新案件', sort: '排序', newest: '最新建立', oldest: '最早建立', number: '案件編號', viewAll: '查看全部', edit: '編輯', delete: '刪除', deleting: '刪除中…', noMatch: '找不到符合條件的案件。'
    },
    reportForm: {
      title: '我要通報', intro: '請提供正確地點與問題說明，照片可協助管理人員快速判斷。', identifier: '學號／員工編號', name: '姓名', email: 'Email', emailPlaceholder: '案件更新通知寄送信箱', location: '地點', category: '問題分類', choose: '請選擇', floor: '樓層', floorPlaceholder: '例如：3F', detail: '詳細位置', detailExtra: '詳細位置補充', detailExtraPlaceholder: '可填補充說明，例如：靠近電梯右側', detailOtherPlaceholder: '例如：3樓男廁入口', description: '問題說明', mapLocation: '問題位置（可點擊地圖選點）', mapLabel: '案件位置地圖', latitude: '緯度', longitude: '經度', currentLocation: '取得目前位置', submit: '送出通報', submitting: '送出中…', success: '通報成功', copy: '複製案件編號'
    },
    upload: { title: '現場照片', description: '請上傳現場照片，幫助管理人員快速判斷狀況。', max: '最多 5 張', size: '每張 5MB', choose: '選擇檔案', none: '未選擇任何檔案', selected: '已選擇 {count} 個檔案', hint: '可一次選取多張，建議拍攝清楚的現場照片。' },
    common: { close: '關閉', backDashboard: '返回 Dashboard', save: '儲存', enabled: '啟用' },
    detail: { eyebrow: '案件詳情', progress: '處理進度', missingFloor: '未填樓層', backBoard: '返回通報看板', loading: '載入中…', loadFailed: '無法載入案件' },
    report: { copy: '複製案件編號', copied: '已複製', copyFailed: '複製失敗' }
  },
  en: {
    nav: { report: 'Report an Issue', track: 'Track Report', board: 'Report Board', admin: 'Admin', switch: '中文' },
    home: {
      eyebrow: 'FCU Campus Repair & Cleaning Reporting System',
      title: 'Campus issues deserve to be seen, tracked, and solved.',
      description: 'Quickly report campus repair, cleaning, and common issues, then track progress with your report number.',
      reportNow: 'Report Now', trackLabel: 'Enter a report number to track progress', trackPlaceholder: 'R20260816XXXX', track: 'Track Progress', loading: 'Checking…',
      reportNo: 'Report Number', copy: 'Copy Report Number', copied: 'Copied',
      errors: { emptyReportNo: 'Enter a report number.', trackFailed: 'Unable to find the report. Please try again later.', submitFailed: 'Unable to submit the report.', locationFailed: 'Location access was unavailable. You can still submit the report.', missingIdentifier: 'Enter your student or employee ID.' },
      features: { photo: 'Photo Reports', photoText: 'Upload up to five photos from the scene.', map: 'Map Location', mapText: 'Record the exact location of the issue.', search: 'Progress Tracking', searchText: 'Enter a report number to view the latest status.' }
    },
    status: { pending: 'Pending', processing: 'In Progress', completed: 'Completed', rejected: 'Rejected' },
    board: {
      title: 'Report Board', keyword: 'Keyword', keywordPlaceholder: 'Report number, location, or description', location: 'Location', category: 'Category', status: 'Status', all: 'All', search: 'Search', none: 'No matching reports.', total: 'Total: {count}'
    },
    dashboard: {
      title: 'Admin Dashboard', realtime: 'Live report overview', data: 'Data Management', accounts: 'Account Management', logout: 'Log out', today: 'Today’s Reports', viewAllCases: 'View all reports', pending: 'Pending', pendingList: 'View pending reports', processing: 'In Progress', processingList: 'View reports in progress', completed: 'Completed', completedList: 'View completed reports', average: 'Average Processing Time', basedOnCompleted: 'Based on completed reports', category: 'Issue Categories', categoryHint: 'See which issues occur most often', building: 'Reports by Location', buildingHint: 'See where issues are concentrated', latest: 'Latest Reports', sort: 'Sort', newest: 'Newest', oldest: 'Oldest', number: 'Report Number', viewAll: 'View all', edit: 'Edit', delete: 'Delete', deleting: 'Deleting…', noMatch: 'No reports match your search.'
    },
    reportForm: {
      title: 'Report an Issue', intro: 'Please provide the location and a clear description. Photos help our staff assess the issue quickly.', identifier: 'Student / Employee ID', name: 'Name', email: 'Email', emailPlaceholder: 'Email for status updates', location: 'Location', category: 'Category', choose: 'Select', floor: 'Floor', floorPlaceholder: 'e.g. 3F', detail: 'Specific Location', detailExtra: 'Additional Location Details', detailExtraPlaceholder: 'Optional details, e.g. near the right side of the elevator', detailOtherPlaceholder: 'e.g. entrance to the men’s restroom on the 3rd floor', description: 'Issue Description', mapLocation: 'Issue Location (click the map to pin)', mapLabel: 'Report location map', latitude: 'Latitude', longitude: 'Longitude', currentLocation: 'Use Current Location', submit: 'Submit Report', submitting: 'Submitting…', success: 'Report submitted successfully.', copy: 'Copy Report Number'
    },
    upload: { title: 'Scene Photos', description: 'Upload photos to help staff assess the issue quickly.', max: 'Up to 5', size: '5MB each', choose: 'Choose Files', none: 'No files selected', selected: '{count} file(s) selected', hint: 'You can select multiple files. Clear photos are recommended.' },
    common: { close: 'Close', backDashboard: 'Back to Dashboard', save: 'Save', enabled: 'Enabled' },
    detail: { eyebrow: 'Report Details', progress: 'Progress', missingFloor: 'Floor not provided', backBoard: 'Back to Report Board', loading: 'Loading…', loadFailed: 'Unable to load the report.' },
    report: { copy: 'Copy report number', copied: 'Copied', copyFailed: 'Copy failed' }
  }
};

const dataTranslations = {
  '主校區': 'Main Campus',
  '資訊電機館': 'Information and Electrical Engineering Building', '商學館': 'College of Business', '圖書館': 'Library', '人言大樓': 'Language and Culture Building', '行政一館': 'Administration Building I', '行政二館': 'Administration Building II', '忠勤樓': 'Zhongqin Building', '科學與航太館': 'Science and Aerospace Building', '土木水利館': 'Civil and Hydraulic Engineering Building', '體育館': 'Gymnasium', '共善樓': 'Gongshan Building', '丘逢甲紀念館': 'Chiu Feng-Chia Memorial Hall', '福星校區': 'Fuxing Campus', '其他地點': 'Other Location',
  '修繕': 'Repair', '清潔': 'Cleaning', '其他問題': 'Other Issue', '常見問題': 'Common Issues', '其他': 'Other', '電燈不亮': 'Lights Out', '冷氣不冷': 'Air Conditioning', '漏水': 'Water Leak', '磁磚隆起': 'Raised Tiles', '廁所清潔': 'Restroom Cleaning', '教室清潔': 'Classroom Cleaning', '用餐區清潔': 'Dining Area Cleaning', '案件建立': 'Report created', '處理中': 'In Progress', '待處理': 'Pending', '已完成': 'Completed', '已退件': 'Rejected', '查無問題': 'No issue found', '系統管理員': 'System Administrator',
  '教室入口': 'Classroom Entrance', '教室內部': 'Inside Classroom', '走廊': 'Hallway', '廁所': 'Restroom', '電梯口': 'Elevator Lobby', '樓梯間': 'Stairwell', '飲水機': 'Water Dispenser', '用餐區': 'Dining Area', '停車場': 'Parking Lot', '其他（自行輸入）': 'Other (enter manually)'
};

const messageTranslations = {
  '資料載入失敗': 'Unable to load data.', '無法載入案件': 'Unable to load the report.', '通報成功': 'Report submitted successfully.',
  '送出失敗': 'Unable to submit the report.', '無法取得定位，仍可繼續送出': 'Location access was unavailable. You can still submit the report.',
  '案件查詢失敗，請稍後再試': 'Unable to find the report. Please try again later.', '查無案件': 'Report not found.',
  '查無此案件編號，請確認後再試': 'Report number not found. Please check it and try again.', '請輸入案件編號': 'Enter a report number.',
  '學號／員工編號、姓名、Email、地點、分類、詳細位置與問題說明為必填': 'Student/employee ID, name, email, location, category, specific location, and issue description are required.',
  '請輸入有效的 Email': 'Enter a valid email address.', '送出過於頻繁，請稍後再試': 'Too many submissions. Please try again later.',
  '送出次數已達上限，請稍後再試': 'The submission limit has been reached. Please try again later.'
};

export function t(key, params = {}) {
  const value = key.split('.').reduce((result, part) => result?.[part], messages[locale.value]) ?? key;
  return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? '');
}

export function toggleLocale() {
  locale.value = locale.value === 'zh' ? 'en' : 'zh';
  localStorage.setItem('fcu_locale', locale.value);
}

export function localizeData(value) {
  const text = String(value ?? '');
  if (locale.value !== 'en') return text;
  return text.split(' · ').map((part) => dataTranslations[part] || part).join(' · ');
}

export function localizeMessage(value) {
  const text = String(value ?? '');
  return locale.value === 'en' ? (messageTranslations[text] || text) : text;
}
