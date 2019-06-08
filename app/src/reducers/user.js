export const initialState = {
  id: null,
  isAuthenticated: false,
  firebase: null,
  profile: null,
  actions: [],
  authForm: { displayName: null, email: null, password: null, passwordConf: null },
  profileForm: {
    displayName: null,
    email: null,
    password: null,
    passwordConf: null,
    phoneNumber: null,
    photoURL: null,
    city: null,
    state: null,
    neighborhood: null,
    street: null
  }
}

export default function user (state = initialState, action) {
  switch (action.type) {
    case 'FIREBASE_USER_UPDATE': {
      if (action.data) {
        return {
          ...state,
          isAuthenticated: true,
          uid: action.data.user.uid,
          firebase: action.data.user
        }
      }
      return state
    }
    case 'USER_LOGOUT': {
      return initialState
    }
    case 'USER_CHANGE_AUTH_INPUT': {
      if (action.data) {
        return {
          ...state,
          authForm: {
            ...state.authForm,
            [action.data.name]: action.data.value
          }
        }
      }
      return state
    }
    case 'USER_CHANGE_PROFILE': {
      if (action.data) {
        return {
          ...state,
          profile: {
            ...state.profile,
            ...action.data.profile
          }
        }
      }
      return state
    }
    case 'USER_UPDATE_ACTIONS': {
      if (action.data) {
        let dataActions = [...action.data.actions]
        let oldActions = [...state.actions]
        let newActions = oldActions.map(item => {
          let updatedActionIndex
          const updatedAction = dataActions.find((action, index) => {
            if (action.id === item.id) return updatedActionIndex = index
            return false
          })

          if (updatedAction) {
            dataActions.splice(index, 1)

            return { ...item, ...updatedAction }
          }

          return item
        })

        if (dataActions.length > 0) newActions = [...newActions, ...dataActions]

        return { ...state, actions: newActions }
      }
      return state
    }
    case 'USER_CHANGE_ACTION': {
      if (action.data) {
        const oldActions = [...state.actions]
        const newAction = action.data.action
        let wasUpdated = false
        let actions = oldActions.map(item => {
          if (item.id === newAction.id) {
            wasUpdated = true
            return { ...newAction }
          }
          return item
        })

        if (!wasUpdated) actions.push(action.data.action)

        return { ...state, actions }
      }
      return state
    }
    case 'USER_CHANGE_PROFILE_INPUT': {
      if (action.data) {
        return {
          ...state,
          profileForm: {
            ...state.profileForm,
            [action.data.name]: action.data.value
          }
        }
      }
      return state
    }
    case 'USER_FILL_PROFILE_FORM': {
      return {
        ...state,
        profileForm: { ...state.profileForm, ...action.data.profileForm }
      }
    }
    default:
      return state
  }
}
