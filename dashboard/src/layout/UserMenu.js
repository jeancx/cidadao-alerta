import PersonIcon from '@material-ui/icons/Person'
import React from 'react'
import { MenuItemLink, UserMenu } from 'react-admin'

const CustomUserMenu = props => (
  <UserMenu {...props}>
    <MenuItemLink
      to="/profile"
      primaryText="Perfil"
      leftIcon={<PersonIcon/>}
    />
  </UserMenu>
)

export default CustomUserMenu
