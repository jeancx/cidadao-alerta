export const initialState = {
  list: [],
  form: {
    pictures: [],
    category: { id: null },
    subcategory: { id: null },
    description: '',
    geolocation: {},
    address: {},
    snapshot: ''
  },
  answers: {}
}

export default function reports (state = initialState, action) {
  switch (action.type) {
    case 'REPORT_PREPEND': {
      if (action.data) {
        return {
          ...state,
          list: [action.data.report, ...state.list]
        }
      }
      return state
    }
    case 'REPORTS_UPDATE': {
      if (action.data) {
        return {
          ...state,
          list: action.data.reports
        }
      }
      return state
    }
    case 'REPORT_CHANGE': {
      if (action.data) {
        const list = [...state.list]
          .map(item => (item.id === action.data.report.id) ? action.data.report : item)

        return {
          ...state,
          list
        }
      }
      return state
    }
    case 'REPORT_DELETE': {
      if (action.data) {
        return {
          ...state,
          list: [...state.list].filter(item => item.id !== action.data.reportId)
        }
      }
      return state
    }
    case 'REPORT_COMMENT_DELETE': {
      if (action.data) {
        return {
          ...state,
          list: [...state.list].map(report => {
            if (report.id === action.data.reportId) {
              let form = { ...report }
              form.comments = [...form.comments].filter(comment => comment.id !== action.data.commentId)
              return form
            }
            return report
          })
        }
      }
      return state
    }
    case 'REPORTS_ANSWERS_UPDATE': {
      if (action.data) {
        return {
          ...state,
          answers: { ...state.answers, [action.data.reportId]: new Date() }
        }
      }
      return state
    }
    case 'REPORT_FORM_LOAD': {
      if (action.data.report) {
        return {
          ...state,
          form: { ...action.data.report }
        }
      } else {
        return {
          ...state,
          form: { ...state.list.find(report => report.id === action.data.report.id) }
        }

      }
    }
    case 'REPORT_FORM_RESET': {
      return {
        ...state,
        form: initialState.form
      }
    }
    case 'REPORT_FORM_ADD_PICTURE': {
      if (action.data) {
        return {
          ...state,
          form: {
            ...state.form,
            pictures: [...state.form.pictures, action.data.picture]
          }
        }
      }
      return state
    }
    case 'REPORT_FORM_REMOVE_PICTURE': {
      if (action.data) {
        return {
          ...state,
          form: {
            ...state.form,
            pictures: [...state.form.pictures.filter(picture => picture !== action.data.picture)]
          }
        }
      }
      return state
    }
    case 'REPORT_FORM_CHANGE_LOCATION': {
      if (action.data) {
        return {
          ...state,
          form: {
            ...state.form,
            geolocation: action.data.geolocation,
            address: action.data.address,
            snapshot: action.data.snapshot
          }
        }
      }
      return state
    }
    case 'REPORT_FORM_CHANGE_INPUT': {
      if (action.data) {
        return {
          ...state,
          form: {
            ...state.form,
            [action.data.name]: action.data.value
          }
        }
      }
      return state
    }
    default:
      return state
  }
}
