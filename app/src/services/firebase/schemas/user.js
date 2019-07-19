import { dateToTimestamp } from './functions'

export function buildUserActionSchema (type, docId, points) {
  return {
    'type': type,
    'docId': docId,
    'points': points,
    'createdAt': dateToTimestamp()
  }
}

export function buildUserStatisticsSchema (statistics = {}) {
  return {
    'report': statistics && Array.isArray(statistics.report) ? statistics.report : [],
    'support': statistics && Array.isArray(statistics.support) ? statistics.support : [],
    'comment': statistics && Array.isArray(statistics.comment) ? statistics.comment : [],
    'share': statistics && Array.isArray(statistics.share) ? statistics.share : [],
    'solved': statistics && Array.isArray(statistics.solved) ? statistics.solved : [],
    'denounced': statistics && Array.isArray(statistics.denounced) ? statistics.denounced : [],
    'invite': statistics && Array.isArray(statistics.invite) ? statistics.invite : [],
    'trophy': statistics && Array.isArray(statistics.trophy) ? statistics.trophy : [],
    'experience': statistics && Number.isInteger(statistics.experience) ? statistics.experience : 0,
    'level': statistics && Number.isInteger(statistics.level) ? statistics.level : 0
  }
}

export function buildUserSchema ({password, passwordConf, ...model}) {
  return {
    ...model,
    'displayName': model.displayName,
    'email': model.email,
    'phoneNumber': model.phoneNumber || '',
    'photoURL': model.photoURL || '',
    'city': model.city || '',
    'state': model.state || '',
    'neighborhood': model.neighborhood || '',
    'street': model.street || '',
    'statistics': buildUserStatisticsSchema(model.statistics),
    'createdAt': dateToTimestamp(model.updatedAt),
    'updatedAt': dateToTimestamp(model.updatedAt),
  }
}
