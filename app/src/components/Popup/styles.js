export default {
  modal: { top: 0, zIndex: 100, elevation: 100, flex: 100 },
  view: {
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
    height: 200,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: 'white',
    flex: 30,
    borderColor: '#CCCCCC',
    borderWidth: .6
  },
  closeButton: {
    backgroundColor: '#333333',
    opacity: 0,
    flex: 100
  },
  closeIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: 10
  },
  mainContent: {
    flexDirection: 'row',
    flex: 300,
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10
  },
  content: {
    flexDirection: 'row'
  },
  contentText: {
    fontSize: 20
  },
  actionButtons: {
    height: 60,
    flex: 100,
    flexDirection: 'row'
  },
  cancelButton: {
    borderColor: '#EEEEEE',
    borderWidth: 1,
    flex: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelTitle: {
    fontSize: 20
  },
  confirmButton: {
    borderColor: '#EEEEEE',
    borderWidth: 1,
    flex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5067FF'
  },
  confirmTitle: {
    color: 'white',
    fontSize: 20
  }
}
