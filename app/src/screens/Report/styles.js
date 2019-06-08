import { Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

export default {
  flex: {
    flex: 1
  },
  headerView: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 9999
  },
  header: {
    paddingTop: 20,
    height: 76
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  img: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%'
  },
  list: {
    padding: 0
  },
  listItem: {
    marginLeft: 0,
    paddingLeft: 0,
    paddingBottom: 20
  },
  listItemLeft: {
    paddingLeft: 10,
  },
  button: {
    borderColor: '#8E8E8E',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center'
  },
  text: {
    color: '#8E8E8E',
  },
  commentTitle: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10
  },
  addCommentView: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20
  },
  menuTriggerView: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  iconColor: {
    color: '#3F51B5'
  }
}
