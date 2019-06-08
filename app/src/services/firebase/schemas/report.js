import { buildAuthorSchema } from './author'
import { coordsToGeopoint, dateToTimestamp } from './functions'

export function buildReportSchema (model, user) {
  return {
    ...model,
    'active': model.active || false,
    'address': model.address || {},
    'author': buildAuthorSchema(user),
    'category': model.category || { 'code': '', 'name': '' },
    'createdAt': dateToTimestamp(model.createdAt),
    'description': model.description.trim(),
    'geolocation': coordsToGeopoint(model.geolocation),
    'pictures': model.pictures || [],
    'subcategory': model.subcategory || { 'code': '', 'name': '' },
    'updatedAt': dateToTimestamp(),
    'userId': model.userId || user.uid
  }
}

export function buildReportMarkSchema (type, model, user) {
  return {
    'type': type,
    'active': true,
    'userId': user.uid,
    'author': buildAuthorSchema(user),
    'description': model.description,
    'pictures': model.pictures || [],
    'createdAt': dateToTimestamp(),
    'updatedAt': dateToTimestamp()
  }
}

export function buildReportCommentSchema (model, user = null) {
  return {
    'text': model.text,
    'createdAt': model.createdAt || dateToTimestamp(),
    'updatedAt': dateToTimestamp(),
    'author': buildAuthorSchema(user)
  }
}

export function buildReportActionSchema (type, user) {
  return {
    'type': type,
    'active': true,
    'userId': user.uid,
    'createdAt': dateToTimestamp(),
    'updatedAt': dateToTimestamp()
  }
}

export function buildReportStatisticsSchema (statistics = {}) {
  return {
    'support': statistics && Number.isInteger(statistics.support) ? statistics.support : 0,
    'comment': statistics && Number.isInteger(statistics.comment) ? statistics.comment : 0,
    'share': statistics && Number.isInteger(statistics.share) ? statistics.share : 0,
    'solved': statistics && Number.isInteger(statistics.solved) ? statistics.solved : 0,
    'denounced': statistics && Number.isInteger(statistics.denounced) ? statistics.denounced : 0
  }
}
