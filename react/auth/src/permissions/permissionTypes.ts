export interface IFirebaseRuleAuth {
  uid: string
  token: {
    email: string
    emailVerified: boolean
    phoneNumber: string
    name: string
  }
}

export interface IFirebaseRuleResource {
  id?: string
  data: any
}

export interface IFirebaseRuleQuery {
  limit: number
  // we intentionally disable offset since
  // they're not available for web & mobile sdk
  // orderBy should be added later
}

export interface IFirebaseRuleRequest {
  auth: IFirebaseRuleAuth
}

export interface IFirebaseRuleRequestWithQuery extends IFirebaseRuleRequest {
  query: IFirebaseRuleQuery
}

export interface IFirebaseRuleRequestWithData extends IFirebaseRuleRequest {
  resource: IFirebaseRuleResource
}

export type listRule = (
  request: IFirebaseRuleRequest | IFirebaseRuleRequestWithQuery,
  resource?: IFirebaseRuleResource
) => boolean

export type getRule = (
  request: IFirebaseRuleRequest,
  resource?: IFirebaseRuleResource
) => boolean

export type createRule = (
  request: IFirebaseRuleRequest | IFirebaseRuleRequestWithData
) => boolean

export type updateRule = (
  request: IFirebaseRuleRequest | IFirebaseRuleRequestWithData,
  resource?: IFirebaseRuleResource
) => boolean

export type deleteRule = (
  request: IFirebaseRuleRequest | IFirebaseRuleRequestWithData
) => boolean

export type CollectionRules = Partial<{
  // collection real name
  _name: string
  read: getRule | listRule
  list: listRule
  get: getRule
  write: createRule | updateRule | deleteRule
  create: createRule
  update: updateRule
  delete: deleteRule
}>

export interface IPermissions {
  [key: string]: CollectionRules
}
