import AuthDrivers from '../AuthDrivers'

export default interface IAuthDriver {
  driverId: AuthDrivers
  onSiteLoad?: Function
  onLogin?: Function
  onLogout?: Function
}
