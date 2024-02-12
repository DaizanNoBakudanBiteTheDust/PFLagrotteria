export default class infoDto {
    constructor(user) {
        this.name = `${user.first_name} ${user.last_name}`;
        this.age = `${user.age}`;
    }
}