export const initialState = {
  list: []
}

export default function categories (state = initialState, action) {
  switch (action.type) {
    case 'CATEGORIES_UPDATE': {
      if (action.data.categories.length > 0) {
        return {
          ...state,
          list: [...action.data.categories]
        }
      }
      return state
    }
    default:
      return state
  }
}
