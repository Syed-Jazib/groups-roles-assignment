import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeWhile } from 'rxjs';
import { Group } from './models/group.model';
import { Role } from './models/role.model';
import { DataService } from './services/data.service';
import { Utilities } from './utils/utilities';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private aliveSusbcription = true;
  public creatingNewGroup = false;
  public creatingNewRole = false;
  public editingNewGroup = false;
  public editingNewRole = false;
  public currentGroup: Group | undefined;
  public currentRole: Role | undefined;
  public showRoles = false;
  public showAccessRights = false;
  public currentTab = 'groups';
  public filterBasedOnMarked: 'All' | 'Marked' | 'UnMarked' = 'Marked';
  public groups: Group[] = [];
  public roles: Role[] = [];
  public filteredAccessRights: string[] = [];
  public filteredRoles: Role[] = [];
  public accessRights: string[] = [];
  public groupName: string = '';
  public roleName: string = '';
  public roleSearch: string = '';
  public accessRightSearch: string = '';
  public totalRolesCount = 0;
  public totalAccessRightsCount = 0;
  public roleStartIndex = 0;
  public roleEndIndex = 0;
  public accessRightsStartIndex = 0;
  public accessRightsEndIndex = 0;
  public rolesPageSize = 5;
  public accessRightsPageSize = 5;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    //Get Access Rights from JSON File.
    this.dataService.getAccessRights().pipe(takeWhile(() => this.aliveSusbcription)).subscribe((accessRights: string[]) => {
      this.accessRights = accessRights;
      this.accessRightsEndIndex = Math.min(accessRights.length, this.accessRightsPageSize);
      this.totalAccessRightsCount = accessRights.length;
      this.filteredAccessRights = JSON.parse(JSON.stringify(this.accessRights));
    });
    //Get saved Groups from Local Storage.
    this.dataService.getSavedGroups().pipe(takeWhile(() => this.aliveSusbcription)).subscribe((groups: Group[]) => {
      this.groups = groups;
      if (this.groups.length) {
        this.onGroupClick(this.groups[0]);
      }
    });
    this.getSavedRoles();
  }

  //Get saved Roled from Local Storage.
  getSavedRoles() {
    this.dataService.getSavedRoles().pipe(takeWhile(() => this.aliveSusbcription)).subscribe((roles: Role[]) => {
      this.roles = roles;
      this.roleEndIndex = Math.min(roles.length, this.rolesPageSize);
      if (this.roles.length) {
        this.totalRolesCount = this.roles.length;
        this.onRoleClick(this.roles[0]);
      }
      this.filteredRoles = JSON.parse(JSON.stringify(this.roles));
    });
  }
  //On Clicking Group Tab
  public onGroupClick(group: Group) {
    this.currentGroup = group;
    this.showRoles = true;
    this.groups.forEach((group: Group) => group.isActive = false);
    group.isActive = !group.isActive;
    this.getSavedRoles()
  }

  //On Clicking Role Tab.
  public onRoleClick(role: Role) {
    this.currentRole = role;
    this.showAccessRights = true;
    this.roles.forEach((role: Role) => role.isActive = false);
    role.isActive = !role.isActive;
  }

  //Checking Role Present in selected Group.
  public isPresentInGroup(role: Role) {
    return !!this.currentGroup?.roleIds.find((id: string) => id === role.id);
  }

  //Checking Access Right in selected Role.
  public isPresentInRole(accessRight: string) {
    return !!this.currentRole?.accessRights.find((access: string) => access === accessRight);
  }

  //Toggling Role in the selected Group
  public toggleTheRoleInTheGroup(role: Role) {
    const index = this.currentGroup?.roleIds.findIndex((id: string) => id === role.id) || -1;
    if (index != -1) {
      this.currentGroup?.roleIds.splice(index, 1);
    } else {
      this.currentGroup?.roleIds.push(role.id);
    }
    this.updateGroups();
  }

  //Updating Selected Group
  private updateGroups() {
    const groupsCopy = JSON.parse(JSON.stringify(this.groups));
    groupsCopy.forEach((group: Group) => group.isActive = false);
    this.dataService.saveGroups(groupsCopy);
  }

  //Toggling Access Rights in Selected Role
  public toggleTheAccessRightInTheRole(accessRight: string) {
    const index = this.currentRole?.accessRights.findIndex((access: string) => access === accessRight) || -1;
    if (index != -1) {
      this.currentRole?.accessRights.splice(index, 1);
    } else {
      this.currentRole?.accessRights.push(accessRight);
    }
    this.updateRoles();
  }

  //Updating Selected ROle
  private updateRoles() {
    const rolesCopy = JSON.parse(JSON.stringify(this.roles));
    rolesCopy.forEach((role: Role) => role.isActive = false);
    this.dataService.saveRoles(rolesCopy);
  }
  public editGroup(group: any) {
    this.groupName = group.label;
    this.editingNewGroup = true;
  }
  public editRole(role: any) {
    this.roleName = role.label;
    this.editingNewRole = true;
  }
  //Editing Group or Role
  public edit(isGroup: boolean) {
    if (!this.groupName && !this.roleName) {
      this.onCancel();
      return;
    }
    if (isGroup && this.currentGroup) {
      this.currentGroup.label = this.groupName;
      const groupsCopy = JSON.parse(JSON.stringify(this.groups));
      groupsCopy.forEach((group: Group) => group.isActive = false);
      this.dataService.saveGroups(groupsCopy);
      this.editingNewGroup = false;
      this.groupName = '';
    }
    if (!isGroup && this.currentRole) {
      this.currentRole.label = this.roleName;
      const rolesCopy = JSON.parse(JSON.stringify(this.roles));
      this.filteredRoles = JSON.parse(JSON.stringify(this.roles));
      rolesCopy.forEach((role: Role) => role.isActive = false);
      this.dataService.saveRoles(rolesCopy);
      this.editingNewRole = false;
      this.roleName = '';
    }
  }
  //Saving Group or role
  public save(isGroup: boolean) {
    if (!this.groupName && !this.roleName) {
      this.onCancel();
      return;
    }
    if (isGroup) {
      const newGroup = {
        id: Utilities.CreateGuid(),
        label: this.groupName,
        roleIds: [],
        isActive: false
      };

      this.groups.push(newGroup);
      const groupsCopy = JSON.parse(JSON.stringify(this.groups));
      groupsCopy.forEach((group: Group) => group.isActive = false);
      this.dataService.saveGroups(groupsCopy);
      this.creatingNewGroup = false;
      this.groupName = '';

    } else {
      const newRole = {
        id: Utilities.CreateGuid(),
        label: this.roleName,
        accessRights: [],
        isActive: false
      };

      this.roles.push(newRole);
      const rolesCopy = JSON.parse(JSON.stringify(this.roles));
      this.filteredRoles = JSON.parse(JSON.stringify(this.roles));
      rolesCopy.forEach((role: Role) => role.isActive = false);
      this.dataService.saveRoles(rolesCopy);
      this.creatingNewRole = false;
      this.roleName = '';
    }
  }

  public selectAll() {
    const isGroup = this.currentTab === 'groups';
    if (isGroup && this.currentGroup) {
      this.currentGroup.roleIds = this.roles.map((role: Role) => role.id);
      this.updateGroups();
    }
    if (!isGroup && this.currentRole) {
      this.currentRole.accessRights = [...this.accessRights];
      this.updateRoles();
    }
  }

  public unSelectAll() {
    const isGroup = this.currentTab === 'groups';
    if (isGroup && this.currentGroup) {
      this.currentGroup.roleIds = [];
      this.updateGroups();
    }
    if (!isGroup && this.currentRole) {
      this.currentRole.accessRights = [];
      this.updateRoles();
    }
  }
  //Filter Search
  public onOptionChanged(target: any) {
    switch (target.value) {
      case 'SelectAll':
        this.selectAll();
        break;
      case 'UnSelectAll':
        this.unSelectAll();
        break;
      case 'All':
        this.onFilterOptionClicked('All');
        break;
      case 'Marked':
        this.onFilterOptionClicked('Marked');
        break;
      case 'UnMarked':
        this.onFilterOptionClicked('UnMarked');
        break;
      default:
        break;
    }
  }

  public onFilterOptionClicked(filter: 'All' | 'Marked' | 'UnMarked') {
    this.filterBasedOnMarked = filter;
    if (this.currentTab === 'groups') {
      this.filteredRoles = this.roles.filter((role: Role) => {
        return this.filter(this.isPresentInGroup(role), filter);
      });
    } else {
      this.filteredAccessRights = this.accessRights.filter((accessRight: string) => {
        return this.filter(this.isPresentInRole(accessRight), filter);
      });
    }
  }

  public filter(isPresent: boolean, filter: string) {
    if (filter === 'All') return true;
    if (filter === 'Marked') return isPresent;
    if (filter === 'UnMarked') return !isPresent;
    return true;
  }
  //Pagination
  public onRolePrev() {
    if (this.roleStartIndex <= 0) return;
    this.roleStartIndex -= this.rolesPageSize;
    this.roleEndIndex -= this.rolesPageSize;
  }

  public onRoleNext() {
    if (this.roleEndIndex >= this.filteredRoles.length) return;
    this.roleStartIndex += this.rolesPageSize;
    this.roleEndIndex += this.rolesPageSize;
  }

  public onAccessRightsPrev() {
    if (this.accessRightsStartIndex <= 0) return;
    this.accessRightsStartIndex -= this.accessRightsPageSize;
    this.accessRightsEndIndex -= this.accessRightsPageSize;
  }

  public onAccessRightsNext() {
    if (this.accessRightsEndIndex >= this.filteredAccessRights.length) return;
    this.accessRightsStartIndex += this.accessRightsPageSize;
    this.accessRightsEndIndex += this.accessRightsPageSize;
  }

  public onCancel() {
    this.creatingNewGroup = false;
    this.editingNewGroup = false;
    this.creatingNewRole = false;
    this.editingNewRole = false;
    this.groupName = '';
    this.roleName = '';
  }

  ngOnDestroy(): void {
    this.aliveSusbcription = false;
  }
}
