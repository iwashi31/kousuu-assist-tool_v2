<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="mainPagerVisible" fixed mobile-break-point="1120" app width="250">
      <v-list dense>
        <v-list-tile @click="mainPager = 1">
          <v-list-tile-action>
            <v-icon>alarm</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>工数</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile @click="mainPager = 2">
          <v-list-tile-action>
            <v-icon>settings</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>設定</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar color="blue-grey" dark fixed app>
      <v-toolbar-side-icon @click.stop="mainPagerVisible = !mainPagerVisible"></v-toolbar-side-icon>
      <v-toolbar-title>工数入力支援ツール</v-toolbar-title>
      <v-toolbar-items>
        <v-btn class="pt-2 pr-5 pl-1" flat disabled style="text-transform: none !important;">{{ version }}</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-slide-x-transition hide-on-leave>
      <v-content v-show="mainPager===1">
        <v-tabs v-model="kousuuTab">
          <v-tab>入力</v-tab>
          <v-tab>出力</v-tab>
          <v-tab-item>
            <v-container>
              <v-layout class="mb-2">
                <h2>現在の作業</h2>
              </v-layout>
              <v-layout>
                <v-flex class="mx-2 xs2">
                  <v-select v-model="scheduleInputs.category" :items="categoryNames" label="カテゴリ"></v-select>
                </v-flex>
                <v-flex class="mx-2 xs3">
                  <v-text-field label="作業内容" v-model="scheduleInputs.detail" @keydown.enter="pushSchedule"></v-text-field>
                </v-flex>
                <v-flex>
                  <v-btn color="info" @click="pushSchedule">打刻</v-btn>
                  <v-btn color="info" @click="clearScheduleInputs">クリア</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
            <v-divider class="mx-3"></v-divider>
            <v-container>
              <v-layout class="mb-2">
                <h2>今日のタイムスケジュール</h2>
              </v-layout>
              <v-layout v-for="(schedule, index) in schedules" :key="index">
                <v-flex class="mx-2 xs1">
                  <v-text-field label="開始時刻" v-model="schedule.startTime" :disabled="index!==0" @change="saveSchedules"></v-text-field>
                </v-flex>
                <v-flex class="mx-2 xs1">
                  <v-text-field label="終了時刻" v-model="schedule.endTime" @change="fixEndTime($event, index)"></v-text-field>
                </v-flex>
                <v-flex class="mx-2 xs2">
                  <v-select v-model="schedule.category" :items="categoryNames" label="カテゴリ" @change="saveSchedules"></v-select>
                </v-flex>
                <v-flex class="mx-2 xs2">
                  <v-text-field v-model="schedule.detail" label="作業内容" @change="saveSchedules"></v-text-field>
                </v-flex>
                <v-flex class="mx-2">
                  <v-btn color="info" fab small :disabled="index===0" @click="swapSchedules($event, index - 1)"><v-icon>arrow_upward</v-icon></v-btn>
                  <v-btn color="info" fab small :disabled="index===schedules.length - 1" @click="swapSchedules($event, index)"><v-icon>arrow_downward</v-icon></v-btn>
                  <v-btn class="info" @click="copySchedule($event, index)">コピー</v-btn>
                  <v-btn class="info" @click="deleteSchedule($event, index)">削除</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tab-item>
          <v-tab-item>
            <v-container>
              <v-layout class="mb-2">
                <h2>サマリ</h2>
              </v-layout>
              <v-layout v-for="(summary, index) in summaries" v-if="summary.time > 0" :key="index">
                <v-flex class="mx-2 xs2">
                  <v-text-field label="コストコード" :value="summary.code" readonly></v-text-field>
                </v-flex>
                <v-flex class="mx-2 xs2">
                  <v-text-field label="カテゴリ名" :value="summary.category" readonly></v-text-field>
                </v-flex>
                <v-flex class="ml-2 xs1">
                  <v-text-field label="作業時間" :value="getAliveTime(summary.time)" readonly></v-text-field>
                </v-flex>
                <v-flex class="xs1">
                  <v-tooltip top>
                    <v-btn class="info" slot="activator" fab small v-clipboard:copy="getAliveTime(summary.time)"><v-icon>assignment</v-icon></v-btn>
                    <span>copy to clipboard</span>
                  </v-tooltip>
                </v-flex>
                <v-flex class="xs3">
                  <v-textarea label="作業内容" :value="getSetText(summary.detailSet)" rows="1" readonly></v-textarea>
                </v-flex>
                <v-flex class="mr-2 xs1">
                  <v-tooltip top>
                    <v-btn class="info" slot="activator" fab small v-clipboard:copy="getSetText(summary.detailSet)"><v-icon>assignment</v-icon></v-btn>
                    <span>copy to clipboard</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tab-item>
        </v-tabs>
      </v-content>
    </v-slide-x-transition>
    <v-slide-x-transition hide-on-leave>
      <v-content v-show="mainPager===2" >
        <v-tabs v-model="settingTab">
          <v-tab>カテゴリ</v-tab>
          <v-tab>始業/休憩時間</v-tab>
          <v-tab v-if="false">データ管理</v-tab>
          <v-tab-item>
            <v-container>
              <v-layout class="mb-2">
                <h2>カテゴリ登録</h2>
              </v-layout>
              <v-layout>
                <v-flex class="mx-2 xs2">
                  <v-text-field label="コストコード" v-model="categoryInputs.code"></v-text-field>
                </v-flex>
                <v-flex class="mx-2 xs3">
                  <v-text-field label="カテゴリ名" v-model="categoryInputs.name" @keydown.enter="pushCategory"></v-text-field>
                </v-flex>
                <v-flex>
                  <v-btn color="info" @click="pushCategory">登録</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
            <v-divider class="mx-3"></v-divider>
            <v-container>
              <v-layout class="mb-2">
                <h2>登録済みのカテゴリ</h2>
              </v-layout>
              <v-layout v-for="(category, index) in categories" :key="index">
                <v-flex class="mr-2 xs2">
                  <v-text-field label="コストコード" v-model="category.code" @chanage="changeCode"></v-text-field>
                </v-flex>
                <v-flex class="mx-2 xs3">
                  <v-text-field label="カテゴリ名" v-model="category.name" @change="changeCategoryName($event, index)"></v-text-field>
                </v-flex>
                <v-flex>
                  <v-btn color="info" fab small :disabled="index===0" @click="swapCategories($event, index - 1)"><v-icon>arrow_upward</v-icon></v-btn>
                  <v-btn color="info" fab small :disabled="index===categories.length - 1" @click="swapCategories($event, index)"><v-icon>arrow_downward</v-icon></v-btn>
                  <v-btn color="info" @click="deleteCategory($event, index)">削除</v-btn>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tab-item>
          <v-tab-item>
            <v-container>
              <v-layout>
                <v-flex class="mx-2 xs1">
                  <v-text-field label="始業時間" v-model="jobStartTime" @change="saveSettings"></v-text-field>
                </v-flex>
              </v-layout>
              <v-layout>
                <v-flex class="mx-2 xs1">
                  <v-text-field label="休憩開始時間" v-model="rest.startTime" @change="saveSettings"></v-text-field>
                </v-flex>
                <v-flex class="mx-2 xs1">
                  <v-text-field label="休憩終了時間" v-model="rest.endTime" @change="saveSettings"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-tab-item>
          <v-tab-item>
            <v-container>
              <v-layout>
                <h2>FIXME</h2>
              </v-layout>
              <v-layout>
                <v-btn class="error">削除</v-btn>
              </v-layout>
            </v-container>
          </v-tab-item>
        </v-tabs>
      </v-content>
    </v-slide-x-transition>
  </v-app>
</template>

<script>
  import Vue from 'vue'
  import Storage from 'vue-ls'
  import VueClipboard from 'vue-clipboard2'

  Vue.use(Storage)
  Vue.use(VueClipboard)
  
  export default {
    data: () => ({
      version: 'v2.1.0-SNAPSHOT',
      mainPager: 1,
      mainPagerVisible: null,
      kousuuTab: null,
      settingTab: null,
      jobStartTime: '9:00',
      scheduleInputs: {
        category: null,
        detail: null,
      },
      categoryInputs: {
        code: null,
        name: null
      },
      rest: {
        startTime: '12:00',
        endTime: '13:00'
      },
      categories: [
        //{
        //  code: null,
        //  name: null
        //}
      ],
      schedules: [
        //{
        //  startTime: null,
        //  endTime: null,
        //  category: null,
        //  detail: null
        //}
      ]
    }),
    methods: {
      clearScheduleInputs: function() {
        this.scheduleInputs.category = ''
        this.scheduleInputs.detail = ''
      },
      pushSchedule: function() {
        var category = this.scheduleInputs.category
        var detail = this.scheduleInputs.detail
        if (!category || !detail) return

        var lastSchedule = this.schedules[this.schedules.length - 1]
        var now = new Date()
        var endTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()
        if (lastSchedule !== undefined && lastSchedule.category === category && lastSchedule.detail === detail) {
          lastSchedule.endTime = endTime
          return
        }

        var startTime = this.schedules.length ? lastSchedule.endTime : this.jobStartTime
        this.schedules.push({
          startTime: startTime,
          endTime: endTime,
          category: category,
          detail: detail
        })

        this.scheduleInputs.detail = ''
        Vue.ls.set('schedules', this.schedules)
      },
      swapSchedules: function(event, index) {
        var tmp = Object.assign({}, this.schedules[index])
        this.schedules[index].category = this.schedules[index + 1].category
        this.schedules[index].detail = this.schedules[index + 1].detail
        this.schedules[index + 1].category = tmp.category
        this.schedules[index + 1].detail = tmp.detail
      },
      copySchedule: function(event, index) {
        this.scheduleInputs.category = this.schedules[index].category
        this.scheduleInputs.detail = this.schedules[index].detail
      },
      deleteSchedule: function(event, index) {
        this.schedules.splice(index, 1)
        Vue.ls.set('schedules', this.schedules)
      },
      fixEndTime: function(event, index) {
        if (index === this.schedules.length - 1) return
        this.saveSchedules()
        this.schedules[index + 1].startTime = this.schedules[index].endTime
        Vue.ls.set('schedules', this.schedules)
      },
      saveSchedules: function() {
        var backup = Vue.ls.get('schedules', [])
        for (var idx in this.schedules) {
          if (!this.validateTime(this.schedules[idx].startTime)) {
            this.schedules[idx].startTime = backup[idx].startTime
          }
          if (!this.validateTime(this.schedules[idx].endTime)) {
            this.schedules[idx].endTime = backup[idx].endTime
          }
        }
        Vue.ls.set('schedules', this.schedules)
      },
      pushCategory: function() {
        if (!this.categoryInputs.name) return
        this.categories.push(Object.assign({}, this.categoryInputs))
        Vue.ls.set('categories', this.categories)

        this.categoryInputs.name = ''
      },
      swapCategories: function(event, index) {
        var tmp = Object.assign({}, this.categories[index])
        this.categories.splice(index, 1)
        this.categories.splice(index + 1, 0, tmp)
        Vue.ls.set('categories', this.categories)
      },
      deleteCategory: function(event, index) {
        this.categories.splice(index, 1)
        Vue.ls.set('categories', this.categories)
      },
      changeCode: function() {
        Vue.ls.set('categories', this.categories)
      },
      changeCategoryName: function(event, index) {
        var categoryName = this.categories[index].name

        if (categoryName === '') {
          this.categories[index].name = Vue.ls.get('categories', [])[index].name
          return
        }

        var oldCategoryName = Vue.ls.get('categories', [])[index].name
        for (var idx in this.schedules) {
          if (this.schedules[idx].category === oldCategoryName) {
            this.schedules[idx].category = categoryName
          }
        }
        Vue.ls.set('categories', this.categories)
      },
      getTimeCount: function(time) {
        var times = time.split(':');
        return Number(times[0]) * 60 + Number(times[1]);
      },
      validateTime: function(time) {
        if (time.indexOf('.') != -1) return false

        var vals = time.split(':')
        if (vals.length !== 2) return false
        if (!isFinite(vals[0]) || !isFinite(vals[1])) return false
        if (String(vals[0]).length > 2 || String(vals[1]).length > 2) return false

        var count = this.getTimeCount(time);
        if (count < 0 || count > 60 * 24) return false
        if (vals[1] < 0 || vals[1] >= 60) return false

        return true;
      },
      getTimeRange(startTime, endTime) {
        var startCount = this.getTimeCount(startTime);
        var endCount = this.getTimeCount(endTime);
        if (startCount > endCount) {
          endCount = endCount + 24 * 60;
        }

        // 休憩時間の計算
        var restCount = 0;
        var restStartCount = this.getTimeCount(this.rest.startTime);
        var restEndCount = this.getTimeCount(this.rest.endTime);
        if (restStartCount > restEndCount) {
          restEndCount = restEndCount + 24 * 60;
        }
        if (endCount <= restStartCount || restEndCount <= startCount) {
          restCount = 0;
        } else if (startCount <= restStartCount && restEndCount <= endCount) {
          restCount = restEndCount - restStartCount;
        } else if (startCount <= restStartCount && endCount <= restEndCount) {
          restCount = endCount - restStartCount;
        } else if (restStartCount <= startCount && restEndCount <= endCount) {
          restCount = restEndCount - startCount;
        } else if (restStartCount <= startCount && endCount <= restEndCount) {
          restCount = endCount - startCount;
        }

        return endCount - startCount - restCount;
      },
      getCategoryIndex: function(name) {
        for (var i in this.categories) {
          if (name === this.categories[i].name) return i
        }
        return -1
      },
      getAliveTime: function(minute) {
        var hour = Math.floor(minute / 60)
        minute -= hour * 60
        return hour + '.' + (minute < 10 ? '0' : '') + minute
      },
      getSetText: function(set) {
        var str = '';
        for (var tmp of set) {
          str = str + tmp + '\n'
        }
        return str
      },
      saveSettings: function() {
        if (!this.validateTime(this.jobStartTime)) {
          this.jobStartTime = Vue.ls.get('jobStartTime', '9:00')
          return
        }
        if (!this.validateTime(this.rest.startTime)) {
          this.rest.startTime = Vue.ls.get('rest').startTime
          return
        }
        if (!this.validateTime(this.rest.endTime)) {
          this.rest.endTime = Vue.ls.get('rest').endTime
          return
        }
        Vue.ls.set('jobStartTime', this.jobStartTime)
        Vue.ls.set('rest', this.rest)
      }
    },
    computed: {
      categoryNames: function() {
        var arr = []
        for (var category of this.categories) {
          arr.push(category.name)
        }
        return arr;
      },
      summaries: function() {
        var summaries = []
        for (var category of this.categories) {
          summaries.push({
            code: category.code,
            category: category.name,
            time: 0,
            detailSet: new Set()
          })
        }

        for (var schedule of this.schedules) {
          var idx = this.getCategoryIndex(schedule.category)
          if (idx === -1) continue
          summaries[idx].time = summaries[idx].time + this.getTimeRange(schedule.startTime, schedule.endTime)
          if (!summaries[idx].detailSet.has(schedule.detail) && schedule.detail !== '') {
            summaries[idx].detailSet.add(schedule.detail)
          }
        }

        return summaries
      }
    },
    mounted: function() {
      this.schedules = Vue.ls.get('schedules', [])
      this.categories = Vue.ls.get('categories', [
        {
          code: '',
          name: 'カテゴリ1',
        },
        {
          code: '',
          name: 'カテゴリ2',
        },
        {
          code: '',
          name: 'カテゴリ3',
        }
      ])
      this.rest = Vue.ls.get('rest', {startTime: '12:00', endTime: '13:00'})
      this.jobStartTime = Vue.ls.get('jobStartTime', '9:00')

      Vue.ls.set('schedules', this.schedules)
      Vue.ls.set('categories', this.categories)
      Vue.ls.set('rest', this.rest)
      Vue.ls.set('jobStartTime', this.jobStartTime)
    }
  }
</script>

<style>
</style>
