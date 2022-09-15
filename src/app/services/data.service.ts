import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Group } from '../models/group.model';
import { Role } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private httpClient: HttpClient) { }
//Storing Access Rights in JSON-file
  public getAccessRights() {
    return this.httpClient.get<string[]>("assets/data/access-rights.json");
  }
//Saving Roles into LocalStorage(instead of Database)
  public saveRoles(roles: Role[]) {
    const roleCopy = Object.assign([], roles);
    localStorage.setItem('roles', JSON.stringify(roleCopy));
  }
//Get Roles from LocalStorage(already saved)
  public getSavedRoles(): Observable<Role[]> {
    const roles = localStorage.getItem('roles');
    return of(roles ? JSON.parse(roles) : []);
  }
//Saving Groups into LocalStorage(instead of Database)
  public saveGroups(groups: Group[]) {
    const groupCopy = Object.assign([], groups);
    localStorage.setItem('groups', JSON.stringify(groupCopy));
  }
//Get Groups from LocalStorage(already saved)
  public getSavedGroups(): Observable<Group[]> {
    const groups = localStorage.getItem('groups');
    return of(groups ? JSON.parse(groups) : []);
  }
}
