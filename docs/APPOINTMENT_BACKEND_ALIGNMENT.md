# 预约模块：前端与 `psychological_platform` / OpenAPI 对齐说明

本文档记录 **`mental-health-frontend-min (2)` 与 `psychological_platform` 联调** 过程中，对 **`psychological_platform`（后端）已做的代码修改** 及前端约定，便于后续合并分支或部署时核对。

---

## 零、重新克隆 / 下载后端后的补丁速查

从仓库重新拉取了一份干净的 **`psychological_platform`**，请按下面文件逐一核对或打补丁（路径均相对于 **`psychological_platform/`**）。打完后建议执行 **`mvn -DskipTests compile`** 确认无编译错误。

| 路径 | 操作 | 摘要 |
|------|------|------|
| `src/main/java/sasu/platform/mhm/util/LocalCaptchaStore.java` | **新增** | 进程内验证码存储（与 Redis 写入失败时配合使用）。 |
| `src/main/java/sasu/platform/mhm/pojo/entity/ConsultationSchedule.java` | 修改 | 扁平列表字段 + `scheduleDate` 用 **`Integer`**（1–7）。 |
| `src/main/resources/mapper/ConsulateMapper.xml` | 修改 | `CounselorDetailVOMap` 类型与 `counselorId` 映射（见第一节）。 |
| `src/main/java/sasu/platform/mhm/mapper/ConsulateMapper.java` | 修改 | `counselorList` → **`Page<CounselorDetailVO>`**。 |
| `src/main/java/sasu/platform/mhm/service/impl/ConsulateServiceImpl.java` | 修改 | `counselorList` 用 `CounselorDetailVO`；**`getScheduleByParams` / `counselorList`** 前调用 **`normalizePageQuery`**。 |
| `src/main/java/sasu/platform/mhm/pojo/dto/PageQueryDTO.java` | 修改 | 增加 **`counselorId`**（JSON `counselorId`）供预约列表筛选。 |
| `src/main/java/sasu/platform/mhm/pojo/dto/AppointmentDTO.java` | 修改 | **`@NoArgsConstructor` + `@AllArgsConstructor`**（保留 `@Builder`）。 |
| `src/main/java/sasu/platform/mhm/service/impl/ComminServiceImpl.java` | 修改 | 验证码：**Redis 失败写/读** 时 fallback **`LocalCaptchaStore`**；**`login`** 校验为 **null 安全**（见第 7 节）。 |

---

## 一、`psychological_platform` 后端变更清单

以下路径均相对于仓库中的 **`psychological_platform/`** 目录。

### 1. 实体 `ConsultationSchedule.java`

| 变更 | 说明 |
|------|------|
| 增加扁平字段 | 与 `counselor_schedule` 查询列对齐，供 `getScheduleByParams` 分页列表正确序列化 JSON：`scheduleId`、`counselorId`、`scheduleDate`、`startTime`、`endTime`、`slotDuration`、`availableSlots`、`scheduleType`。 |
| **`scheduleDate` 类型** | 使用 **`Integer`**（星期 **1–7**），与表字段 `schedule_date`（整型）及 `ScheduleCreateDTO` / `CounselorSchedule` 一致。**不得**使用 `java.util.Date`：JDBC 对整型列可能以 `LONG` 返回，MyBatis 映射到 `Date`/`Timestamp` 会报错：`Unsupported conversion from LONG to java.sql.Timestamp`。 |

### 2. MyBatis `ConsulateMapper.xml`

| 变更 | 说明 |
|------|------|
| `CounselorDetailVOMap` 的 `type` | 由 `CounselorVO` 改为 **`CounselorDetailVO`**，否则 `association userVO` 无法绑定到无 `userVO` 字段的 `CounselorVO`。 |
| `CounselorDetailVOMap` 增加映射 | **`counselorId`** ← 列 **`user_id`**（与咨询师主键一致）。 |

### 3. `ConsulateMapper.java`

| 变更 | 说明 |
|------|------|
| `counselorList` 返回值 | 由 `Page<CounselorVO>` 改为 **`Page<CounselorDetailVO>`**，与上述 `resultMap` 一致。 |

### 4. `ConsulateServiceImpl.java`

| 变更 | 说明 |
|------|------|
| `counselorList` | 使用 **`Page<CounselorDetailVO>`** 承接 `consulateMapper.counselorList`。 |
| 分页安全 | 新增 **`normalizePageQuery(PageQueryDTO)`**：在 **`getScheduleByParams`**、**`counselorList`** 中，若 `page` / `pageSize` 为空或非法，默认 **`page=1`、`pageSize=10`**，避免 PageHelper 空指针。 |

### 5. `PageQueryDTO.java`

| 变更 | 说明 |
|------|------|
| 新增字段 | **`counselorId`**（JSON：`counselorId`），供 **`ConsulateMapper.xml` → `listAppointments`** 中 `<if test="counselorId">` 按咨询师筛选预约列表。 |

### 6. `AppointmentDTO.java`

| 变更 | 说明 |
|------|------|
| Lombok | 增加 **`@NoArgsConstructor`**、**`@AllArgsConstructor`**（保留 **`@Builder`**），保证 Jackson 能正确反序列化 **`POST /api/appointment/submit`** 的 JSON body。 |

### 7. 登录验证码（Redis 不可用时）

与预约接口无直接耦合，属同一套前端联调中的后端加固。

| 文件 | 说明 |
|------|------|
| **`util/LocalCaptchaStore.java`**（**新增**） | 进程内验证码缓存（key → 验证码），在 Redis 不可用时使用（可与 `verificationCode()` 的 TTL 策略一致，如约 60 秒）。 |
| **`service/impl/ComminServiceImpl.java`** | **`verificationCode()`**：向 Redis `set` 验证码；**catch** 异常时用 **`LocalCaptchaStore.put`**。 |
| 同上 **`login(...)`** | 从 Redis **`get`** 验证码；**catch** 异常时用 **`LocalCaptchaStore.get(key)`**；校验时对 **`verificationCode` / `code` 做 null 判断** 再 **`equals`**，避免 Redis 不可用时 NPE。 |

---

## 二、前端已封装与约定（`mental-health-frontend-min (2)`）

- `src/api/psychPlatformAppointment.js`：`/api/schedule/list`、`/api/consultant/list`、`/api/appointment/submit`、`/api/appointment/list`、`/api/appointment/my-list` 及分页/提交结果解析；**按学期将 `scheduleDate`(1–7) 展开为公历日**（`expandScheduleRowToSlots` 等）。
- `src/api/appointmentApi.js`：路径与 OpenAPI/后端一致（`submit`、`list` 等）。
- `src/api/appointment.ts`：非 mock 时走真实接口并解包 `PageResult.records`。
- `src/api/appointmentEnv.ts`：**`VITE_USE_MOCK_APPOINTMENT`** — 仅在为 `true` 时使用本地 mock；**默认联调后端**。
- `src/utils/jwtPayload.js`：解析 JWT **`sub`**（与后端写入的 **`user.user_id` UUID** 一致）。
- **`resolveBackendUserIdForAppointmentApi()`**（`appointmentEnv.ts`）：请求 **`GET /api/appointment/list?userId=`** 时必须传 **UUID**，不能传登录用户名。  
  - 原因：`ComminServiceImpl.login` 使用 **`JwtUtil.createJWT(userInfo.getUserId(), …)`**，预约写入的 **`student_id`** 来自 SecurityContext 的同一 **`userId`**。  
  - 曾仅用 `localStorage.studentId = form.username`，导致列表条件 **`ca.student_id = #{userId}`** 永远不匹配 → **`records: []`**。  
  - 修复：`UserLogin` 成功后在本地写入 **`userId` = JWT `sub`**；「我的预约」与选时页排除已约时段时优先使用该值；若无则尝试从当前 **`auth_token` / `access_token`** 解析并回写。

### 控制台里「像咨询师」的 `records`

- 带 **`userVO`、`qualificationLevel`** 等字段的响应来自 **`GET /api/consultant/list`**（选时页拉咨询师姓名），**不是**预约列表。  
- **`GET /api/appointment/list`** 成功时应为 **`appointmentId`、`appointmentDate`、`appointmentTime`、`status`** 等（`AppointmentDetailVO`）。

### 「我的预约」`MyAppointments.vue`

- 表格列与 **`AppointmentDetailVO`** 对齐：`id`、`appointmentDate`、`appointmentTime`、`counselorName`、`appointmentType`、`consultationMode`、`location`、`status`。
- 列表接口：`GET /api/appointment/list?userId=<JWT sub UUID>`（见 `resolveBackendUserIdForAppointmentApi`）。

### 来访登记页 `Appointment.vue`（`/appointment/:id`）

- **已改为** `getAppointmentByIdAsync` → **`GET /api/appointment/detail?id=`**（此前仅用 `mock/appointment.getAppointmentById`，后端 UUID 在 mock 库不存在 → 整页空白）。
- 顶部 **`el-descriptions`** 展示后端预约概要；来访登记 / 量表 / 签署步骤在非 mock 下若调用 `updateAppointmentStatusAsync` 无对应后端状态，会 **提示** 而非静默失败。

### 选时页 `SelectSlot.vue`

- 未设置 `VITE_USE_MOCK_APPOINTMENT=true` 时：请求 `/api/schedule/list`、`/api/consultant/list`、`/api/appointment/submit` 等；提交成功常跳转 **我的预约**（因 `submit` 未返回新建 `appointmentId`）。
- **星期字段**：库表 `schedule_date` 为星期 1–7，前端已按学期展开为日历格展示，避免误用 `new Date(数字)` 导致 1970 年日期被学期范围过滤。

### 环境变量（`.env.development`）

- `VITE_API_PROXY_TARGET`：Vite 代理到后端（如 `http://localhost:8081`）。
- 可选：`VITE_USE_MOCK_APPOINTMENT=true` 时强制预约相关走 mock。

---

## 三、建议后续由后端完善（未改或仅提示）

1. **`POST /api/appointment/submit` 不返回新建预约 ID**  
   若需成功后跳转 `/appointment/:id`，建议在 `R.data` 中增加 `appointmentId`（或 `AppointmentDetailVO`）。

2. **`GET /api/appointment/my-list`**  
   当前实现仍为排班分页（`getScheduleByParams`），与「我的预约」语义不一致；学生端请用 **`GET /api/appointment/list?userId=...`**。

3. **`makeAppointment` 依赖 Redis**  
   锁时段逻辑在无 Redis 时可能异常；若需纯本地开发可再做降级（与验证码 fallback 独立）。

4. **OpenAPI 中后端可能未实现的接口**  
   如排队、评价、`/api/appointment/record/save` 等，需与前端调用处逐一核对。

5. **前端占位 `POST /api/appointment/create`**  
   后端无此路径；真实排班请使用 **`POST /api/schedule/create`（`ScheduleCreateDTO`）**。

6. **`getScheduleByParams` SQL**  
   当前为全表分页，可按 `status`、`available_slots`、日期/星期等补充 `WHERE` 与业务规则。

---

## 四、相关库表与 DTO 语义（便于对照）

- **`counselor_schedule.schedule_date`**：`int`，**星期**（1=周一 … 7=周日），**不是** `yyyy-MM-dd` 公历日（见 `mental-health-platform.sql`、`ScheduleCreateDTO` 注释）。
- **`PageResult`**：`{ total, records }`，列表类接口统一此结构。
学生端家长端字段对齐
d:\mental-health-frontend\mental-health-frontend-min (2)\src\mock\parent.ts
getChildrenList() / getChildProfile() 改为返回后端 ChildVO 字段体系：studentId/studentName/studentNumber/college/major/grade/className/avatar
getPendingParentBinds() 改为返回后端绑定记录同体系字段：relationId/parentId/studentId/studentName/relationType/verificationStatus/createdAt
d:\mental-health-frontend\mental-health-frontend-min (2)\src\mock\studentFamily.ts
学生端“关联记录/发起绑定”的 mock 输出对齐：relationId/parentId/relationType/verificationStatus/verificationInfo/createdAt（并补上 student 信息用于一致性）
d:\mental-health-frontend\mental-health-frontend-min (2)\src\views\parent\children\ChildManagement.vue
待确认列表字段改名并切换按钮传参到 relationId
“我的子女”卡片改用 ChildVO 字段（如 studentName/className/studentId）
“补充绑定”前端把表单数据转换成 ParentBindChildDTO 入参（studentId/studentName/relationType/verificationInfo）
d:\mental-health-frontend\mental-health-frontend-min (2)\src\views\parent\profile\ProfileView.vue
成长档案降级：后端当前仅返回 ChildVO 时，只展示 ChildVO 可用字段（隐藏健康/联系方式/各类档案列表等区块）
子女选择器改用 studentId/studentName
d:\mental-health-frontend\mental-health-frontend-min (2)\src\views\student\family\StudentParentBinding.vue
表单提交字段从 parentPhone/relation 改为 parentId/relationType
列表字段从 parentPhone/relation/status/remark 改为 parentId/relationType/verificationStatus/verificationInfo
状态标签完全基于 verificationStatus 渲染（0=待家长确认，1=已关联）
