<template>
  <div
    v-if="isLoaded"
    key="window-loaded"
  >
    <el-container style="height: 86vh;">
      <Split>
        <SplitArea :size="sizePanel" :min-size="100">
          <el-aside width="100%">
            <split-pane :min-percent="10" :default-percent="defaultPorcentSplitPane" split="vertical">
              <template slot="paneL">
                <!-- this slot is 'paneL' (with 'L' in uppercase) do not change -->
                <div class="left-container">
                  <el-aside v-show="isShowedRecordNavigation" width="100%">
                    <div class="small-4 columns" style="height: 100%;">
                      <div class="w">
                        <div class="open-left" />
                        <div :class="styleTableNavigation">
                          <!-- close record navigation and advanced query panel -->
                          <el-button
                            v-show="!isShowedRecordPanel"
                            :icon="iconShowedRecordNavigation"
                            circle
                            style="margin-left: 10px;"
                            class="el-button-window"
                            @click="handleChangeShowedRecordNavigation(false)"
                          />
                          <!-- complete expand record navigation and advanced query panel  -->
                          <el-button
                            v-show="!isMobile"
                            :icon="iconIsShowedAside"
                            circle
                            class="el-button-window"
                            @click="handleChangeShowedPanel()"
                          />
                        </div>
                        <data-table
                          :parent-uuid="windowUuid"
                          :container-uuid="windowMetadata.currentTab.uuid"
                          :table-name="windowMetadata.currentTab.tableName"
                          :is-showed-panel-record="true"
                          :is-parent="true"
                        />
                      </div>
                    </div>
                  </el-aside>
                </div>
              </template>
              <template slot="paneR">
                <el-container id="PanelRight" style="height: 86vh;">
                  <resize-observer @notify="handleResize" />
                  <Split v-shortkey="['f8']" direction="vertical" @onDrag="onDrag" @shortkey.native="handleChangeShowedRecordNavigation(!isShowedRecordNavigation)">
                    <SplitArea :size="sizeAreaStyle" :style="splitAreaStyle">
                      <el-header
                        v-if="showContextMenu"
                        :style="isWorkflowBarStatus ? 'height: 45px; background: #F5F7FA' : 'height: 40px'"
                      >
                        <el-container>
                          <el-aside width="100%" style="width: 78vw; overflow: hidden;">
                            <el-scrollbar>
                              <workflow-status-bar
                                v-if="isWorkflowBarStatus"
                                :style-steps="styleStepsSimple"
                                :container-uuid="windowMetadata.currentTabUuid"
                                :parent-uuid="windowUuid"
                                :panel-type="panelType"
                              />
                            </el-scrollbar>
                          </el-aside>
                          <el-main>
                            <context-menu
                              v-show="!isShowedRecordPanel"
                              :menu-parent-uuid="$route.meta.parentUuid"
                              :parent-uuid="windowUuid"
                              :container-uuid="windowMetadata.currentTabUuid"
                              :table-name="windowMetadata.currentTab.tableName"
                              :panel-type="panelType"
                              :is-insert-record="windowMetadata.currentTab.isInsertRecord"
                            />
                          </el-main>
                        </el-container>
                      </el-header>
                      <el-main :style="styleMainTab">
                        <tab-parent
                          :window-uuid="windowUuid"
                          :window-metadata="windowMetadata"
                          :tabs-list="windowMetadata.tabsListParent"
                          class="tab-window"
                        />
                        <div v-if="isMobile">
                          <el-card class="box-card">
                            <el-tabs v-model="activeInfo" @tab-click="handleClick">
                              <el-tab-pane
                                name="listChatEntries"
                              >
                                <span slot="label">
                                  <i class="el-icon-s-comment" />
                                  {{ $t('window.containerInfo.notes') }}
                                </span>
                                <chat-entries
                                  :table-name="getTableName"
                                  :record-id="recordId"
                                />
                              </el-tab-pane>

                              <el-tab-pane
                                name="listRecordLogs"
                              >
                                <span slot="label">
                                  <svg-icon icon-class="tree-table" />
                                  {{ $t('window.containerInfo.changeLog') }}
                                </span>
                                <div
                                  key="change-log-loaded"
                                >
                                  <record-logs />
                                </div>
                              </el-tab-pane>

                              <el-tab-pane
                                v-if="getIsWorkflowLog"
                                name="listWorkflowLogs"
                              >
                                <span slot="label">
                                  <i class="el-icon-s-help" />
                                  {{ $t('window.containerInfo.workflowLog') }}
                                </span>
                                <div
                                  v-if="getIsWorkflowLog"
                                  key="workflow-log-loaded"
                                >
                                  <workflow-logs />
                                </div>
                              </el-tab-pane>
                            </el-tabs>
                          </el-card>
                        </div>
                        <div style="right: 0%; top: 40%; position: absolute;">
                          <!-- open container info -->
                          <el-button
                            v-show="!showContainerInfo && !isMobile"
                            type="info"
                            icon="el-icon-info"
                            circle
                            style="float: right;"
                            class="el-button-window"
                            @click="contentInfo"
                          />
                        </div>
                        <div class="small-4 columns">
                          <div class="wrapper">
                            <div
                              v-show="!isEmptyValue(windowMetadata.tabsListChildren)"
                              class="open-detail"
                            />
                            <!-- open childs tabs -->
                            <el-button
                              v-if="windowMetadata.tabsListChildren.length &&
                                (isMobile && !isShowedRecordNavigation || !isMobile)"
                              v-show="!isShowedTabsChildren"
                              icon="el-icon-caret-top"
                              :class="classIsMobile"
                              circle
                              type="primary"
                              @click="handleChangeShowedTabChildren(true)"
                            />
                          </div>
                        </div>
                        <modal-dialog
                          :parent-uuid="windowUuid"
                          :container-uuid="windowMetadata.currentTabUuid"
                        />
                        <div class="small-4 columns">
                          <div class="w">
                            <div class="open-left" />
                            <!-- open record navigation and advanced query if is closed -->
                            <el-button
                              v-show="!isShowedRecordNavigation"
                              :icon="iconShowedRecordNavigation"
                              class="open-navegation"
                              circle
                              type="primary"
                              @click="handleChangeShowedRecordNavigation(true)"
                            />
                          </div>
                        </div>
                      </el-main>
                    </SplitArea>
                    <SplitArea v-show="isShowedTabsChildren" :size="50">
                      <el-header
                        v-if="isShowedTabsChildren && !isEmptyValue(windowMetadata.tabsListChildren)"
                        style="height: auto; padding-right: 35px !important; padding-bottom: 33px;"
                      >
                        <div class="w-33">
                          <div class="center">
                            <!-- close tab children if is openend -->
                            <el-button
                              icon="el-icon-caret-bottom"
                              circle
                              class="el-button-window"
                              @click="handleChangeShowedTabChildren(false)"
                            />
                          </div>
                        </div>
                        <tab-children
                          :window-uuid="windowUuid"
                          :window-metadata="windowMetadata"
                          :tabs-list="windowMetadata.tabsListChildren"
                          :first-tab-uuid="windowMetadata.firstTabUuid"
                          :style="{ 'height': getHeightPanelBottom + 'vh' }"
                        />
                      </el-header>
                    </SplitArea>
                  </Split>
                </el-container>
              </template>
            </split-pane>
          </el-aside>
        </SplitArea>
        <SplitArea :size="showContainerInfo ? isSize : 0">
          <el-main>
            <div :class="isCloseInfo">
              <!-- close container info if is opened -->
              <el-button
                v-show="showContainerInfo"
                type="info"
                icon="el-icon-info"
                circle
                style="float: right;"
                class="el-button-window"
                @click="contentInfo"
              />
            </div>
            <div id="example-1">
              <transition name="slide-fade">
                <p v-if="showContainerInfo">
                  <el-card class="box-card">
                    <el-tabs v-model="activeInfo" @tab-click="handleClick">
                      <el-tab-pane
                        name="listChatEntries"
                      >
                        <span slot="label">
                          <i class="el-icon-s-comment" />
                          {{ $t('window.containerInfo.notes') }}
                        </span>
                        <chat-entries
                          :table-name="getTableName"
                          :record-id="recordId"
                        />
                      </el-tab-pane>

                      <el-tab-pane
                        name="listRecordLogs"
                      >
                        <span slot="label">
                          <svg-icon icon-class="tree-table" />
                          {{ $t('window.containerInfo.changeLog') }}
                        </span>
                        <div
                          v-if="getIsChangeLog"
                          key="change-log-loaded"
                        >
                          <record-logs />
                        </div>
                      </el-tab-pane>

                      <el-tab-pane
                        name="listWorkflowLogs"
                      >
                        <span slot="label">
                          <i class="el-icon-s-help" />
                          {{ $t('window.containerInfo.workflowLog') }}
                        </span>
                        <div
                          key="workflow-log-loaded"
                        >
                          <workflow-logs />
                        </div>
                      </el-tab-pane>
                    </el-tabs>
                  </el-card>
                </p>
              </transition>
            </div>
          </el-main>
        </SplitArea>
      </Split>
    </el-container>
  </div>
  <div
    v-else
    key="window-loading"
    v-loading="!isLoaded"
    :element-loading-text="$t('notifications.loading')"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    class="loading-window"
  />
</template>

<script src="./windowLogicComponent.js" >
// if you use separate component files like this, the script.js should not
// be named 'index.js' as you would have to specify the '/index.vue' suffix
// on your import for every import where this component is used, otherwise
// you might have problems with the template compiler similar to:
// [Vue warn]: Failed to mount component: template or render function not defined.
</script>

<style lang="scss" src="./windowStyleGlobal.scss">
</style>
<style lang="scss" scoped src="./windowStyleScoped.scss">
</style>
