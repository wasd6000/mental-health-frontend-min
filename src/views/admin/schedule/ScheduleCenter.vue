<template>
  <div class="schedule">

    <h3>心理中心 - 智能排班</h3>

    <!-- 工具栏 -->
    <div class="toolbar">
      <select v-model="campus">
        <option>莲湖校区</option>
        <option>南坝校区</option>
      </select>

      <input type="date" v-model="viewDate" />

      <button @click="prevWeek">⬅ 上一周</button>
      <button @click="toToday">📅 今天</button>
      <button @click="nextWeek">下一周 ➡</button>

      <button @click="viewMode='day'">按日查看</button>
      <button @click="viewMode='week'">按周查看</button>

      <button @click="openBatch">
        批量生成排班
      </button>

      <button @click="useTemplate">
        使用周模板
      </button>
    </div>

    <div v-if="viewMode==='week'" class="week-title">
      当前周：{{ weekRange() }}
    </div>

    <!-- 可视化排班表 -->
    <table class="grid">

      <!-- ===== 表头 ===== -->
      <thead>
        <tr>
          <th>时间</th>

          <template v-if="viewMode==='week'">
            <th v-for="d in week" :key="d">
              {{ d }}
            </th>
          </template>

          <th v-else>
            {{ viewDate }}
          </th>
        </tr>

        <tr v-if="viewMode==='week'">
          <th>日期</th>

          <th v-for="item in getWeekDates()" :key="item.date">
            {{ item.date }}
          </th>
        </tr>

      </thead>

      <!-- ===== 表格主体 ===== -->
      <tbody>
        <tr v-for="t in periods" :key="t">
          <td>{{ t }}</td>

          <td
            v-for="col in (viewMode==='week'
              ? getWeekDates()
              : [{ date: viewDate }])"
            :key="col.date"
            @click="changeCounselor(col, t)"
            :class="getCell(col, t)"
          >
            {{ show(col, t) }}
          </td>

        </tr>

      </tbody>

    </table>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  getCounselors,
  getHolidays,
  getPeriods,
  getWeek,
  getSemester,
  initSchedule,
  saveWeekTemplate,
  fetchSchedule,
  updateSchedule,
  clearSchedule,
  generateFromTemplate
} from '../../../mock/schedule'


// ===== 学期信息 =====
const semester = getSemester();

const campus = ref('莲湖校区'); //默认值

// 当前日期
const viewDate = ref(semester.start);

// 查看模式
const viewMode = ref('week'); // week | day

// 获取节假日
const holidays = getHolidays();

// 获取咨询师数据
const counselors = ref(getCounselors());

const selectedCounselor = ref('');

// 获取时间段
const periods = ref(getPeriods());

// 获取一周的日期
const week = getWeek();

// 初始化排班数据
const schedule = ref([])

onMounted(async () => {
  // 直接从存储获取排班，如果为空则初始化
  schedule.value = await fetchSchedule()
  console.log('📊 加载排班数据：', schedule.value.length, '条')
})


// 按日期显示排班
const show = (col, t) => {
  const dateKey = viewMode.value === 'week' ? col.date : col.date;
  const s = schedule.value.find(i => i.date === dateKey && i.time === t);
  return s ? s.counselorName : '';
}

const useTemplate = () => {
  const weekDates = getWeekDates().map(i => i.date);
  const weekData = schedule.value.filter(i => weekDates.includes(i.date));
  saveWeekTemplate(weekData);
  alert('已保存本周为模板');
}

//生成学期排班
const openBatch = async () => {
  const data = generateFromTemplate();
  if (!data.length) {
    alert('请先保存一周模板');
    return;
  }

  schedule.value = data;
  viewDate.value = semester.start;
  
  // 批量保存所有排班到localStorage
  console.log('保存批量排班到localStorage，共', data.length, '条')
  localStorage.setItem('MOCK_SCHEDULE', JSON.stringify(data))
  
  // 派发事件通知学生端刷新
  window.dispatchEvent(new Event('schedule-updated'))
  
  alert('已按周模板生成整个学期，共' + data.length + '条排班');
}

const prevWeek = () => {    //上一周
  const d = new Date(viewDate.value);
  d.setDate(d.getDate() - 7);
  viewDate.value = d.toISOString().slice(0, 10);
}

const nextWeek = () => {    // 下一周
  const d = new Date(viewDate.value);
  d.setDate(d.getDate() + 7);
  viewDate.value = d.toISOString().slice(0, 10);
}

const toToday = () => {   // 当天
  viewDate.value = new Date().toISOString().slice(0, 10);
}

// 当前周范围显示
const weekRange = () => {
  const arr = getWeekDates();
  if (!arr.length) return '';
  return `${arr[0].date} ~ ${arr[4].date}`;
}

const getWeekDates = () => {
  const base = viewDate.value ? new Date(viewDate.value) : new Date();
  const day = base.getDay();
  const monday = new Date(base);
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(base.getDate() + diff);

  const arr = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    arr.push({
      label: ['周一', '周二', '周三', '周四', '周五'][i],
      date: d.toISOString().slice(0, 10),
    });
  }
  return arr;
}

// 获取当前单元格的状态
const getCell = (col, t) => {
  const dateKey = col.date;
  const s = schedule.value.find(i => i.date === dateKey && i.time === t);
  if (!s) return 'free';
  if (selectedCounselor.value) {
    return s.counselorId === selectedCounselor.value ? 'mine' : 'other';
  }
  return 'busy';
}

const changeCounselor = async(col, t) => {
  const dateKey = col.date;
  const index = schedule.value.findIndex(
    i => i.date === dateKey && i.time === t
  );

  let message = '请选择咨询师：\n0. 清空\n';
  counselors.value.forEach((c, i) => {
    message += `${i + 1}. ${c.name}\n`;
  });

  const r = prompt(message);
  if (r === null) return;

  if (r === '0') {
    await clearSchedule(dateKey, t)
  } else {

  const c = counselors.value[Number(r) - 1];
  if (!c) return;

  await updateSchedule({
    date: dateKey,
    time: t,
    counselorId: c.id,
    counselorName: c.name,
  })
  }

  schedule.value = await fetchSchedule()
  
  // 派发 schedule-updated 事件，通知学生预约页面刷新
  window.dispatchEvent(new Event('schedule-updated'))
};

</script>


<style scoped>
.grid {
  width: 100%;
  border-collapse: collapse;
}

.grid td, .grid th {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
  cursor: pointer;
}

.busy {
  background: #dff0d8;
}

.mine {
  background: #cce5ff;
  font-weight: bold;
}

.other {
  background: #f0f0f0;
  color: #999;
}

.free {
  background: #fff;
}


.toolbar {
  margin-bottom: 10px;
}
</style>