import { Permissions, Notifications } from 'expo'

const PUSH_ENDPOINT = 'https://your-server.com/users/push-token'

export async function askPermissions () {
  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
    finalStatus = status
  }

  return finalStatus === 'granted'
}

export async function sendNotification (title, body) {
  if (await askPermissions()) {
    return await Notifications.presentLocalNotificationAsync({
      title: title,
      body: body,
    })
  }
}

export async function scheduleNotification (title, body) {
  if (await askPermissions()) {
    return await Notifications.scheduleLocalNotificationAsync(
      {
        title: title,
        body: body,
      },
      {
        repeat: 'minute',
        time: new Date().getTime() + 10000,
      },
    )
  }
}
