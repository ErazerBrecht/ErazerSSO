export class AppComponent implements ng.IComponentOptions {
    template: string;
    controller: ng.IControllerConstructor;

    constructor() {
        this.template = require("./app.template.html");
        this.controller = AppController;
    }
};

export class AppController implements ng.IComponentController {

    constructor() {
    }

    $onInit() {

    }

    $onChanges(changes: ng.IOnChangesObject) { 

    }
}