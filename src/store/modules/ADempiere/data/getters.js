
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

const getters = {
  /**
   * Used by datatables in tab children, record navigation in window, result in browser
   * @param {string} containerUuid
   */
  getDataRecordAndSelection: (state, getters) => (containerUuid) => {
    return state.recordSelection.find(itemRecord => {
      return itemRecord.containerUuid === containerUuid
    }) || {
      containerUuid,
      record: [],
      recordCount: 0,
      selection: [],
      pageNumber: 1,
      nextPageToken: undefined,
      originalNextPageToken: undefined,
      isLoadedContext: false,
      isLoaded: false
    }
  },
  getDataRecordsList: (state, getters) => (containerUuid) => {
    return getters.getDataRecordAndSelection(containerUuid).record
  },
  getDataRecordSelection: (state, getters) => (containerUuid) => {
    return getters.getDataRecordAndSelection(containerUuid).selection
  },
  getPageNumber: (state, getters) => (containerUuid) => {
    return getters.getDataRecordAndSelection(containerUuid).pageNumber
  },
  getRowData: (state, getters) => ({ containerUuid, recordUuid, index }) => {
    const recordsList = getters.getDataRecordsList(containerUuid)
    if (!isEmptyValue(index)) {
      return recordsList[index]
    }
    return recordsList.find(itemData => {
      if (itemData.UUID === recordUuid) {
        return true
      }
    })
  },
  /**
   * Getter converter selection data record in format
   * @param {string} containerUuid
   * @param {array}  selection
   * [{
   *    selectionId: keyColumn Value,
   *    selectionValues: [{ columnName, value }]
   * }]
   */
  getSelectionToServer: (state, getters, rootState, rootGetters) => ({ containerUuid, selection = [] }) => {
    const selectionToServer = []
    const withOut = ['isEdit', 'isSendToServer']

    if (selection.length <= 0) {
      selection = getters.getDataRecordSelection(containerUuid)
    }
    if (selection.length) {
      const { fieldsList, keyColumn } = rootGetters.getPanel(containerUuid)
      // reduce list
      const fieldsListSelection = fieldsList.filter(itemField => {
        return itemField.isIdentifier || itemField.isUpdateable
      })

      selection.forEach(itemRow => {
        const records = []

        Object.keys(itemRow).forEach(key => {
          if (!key.includes('DisplayColumn') && !withOut.includes(key)) {
            // evaluate metadata attributes before to convert
            const field = fieldsListSelection.find(itemField => itemField.columnName === key)
            if (field) {
              records.push({
                columnName: key,
                value: itemRow[key]
              })
            }
          }
        })

        selectionToServer.push({
          selectionId: itemRow[keyColumn],
          selectionValues: records
        })
      })
    }
    return selectionToServer
  },
  getContextInfoField: (state) => (contextInfoUuid, sqlStatement) => {
    return state.contextInfoField.find(info =>
      info.contextInfoUuid === contextInfoUuid &&
      info.sqlStatement === sqlStatement
    )
  },
  getRecordPrivateAccess: (state) => (tableName, recordId) => {
    if (!isEmptyValue(tableName) && !isEmptyValue(recordId)) {
      if (state.recordPrivateAccess.tableName === tableName && state.recordPrivateAccess.recordId === recordId) {
        return state.recordPrivateAccess
      }
      return undefined
    }
  }
}

export default getters
