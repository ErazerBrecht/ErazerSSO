import { IResult } from '../../models/result.models'
import './home.style.scss';
import { HomeService } from './home.service';

export class HomeComponent implements ng.IComponentOptions {
    controller: ng.IControllerConstructor;
    template: string;

    constructor() {
        this.controller = HomeController;
        this.template = require('./home.template.html');
    }
}

class HomeController implements ng.IComponentController {
    results: Array<IResult>;

    constructor(private homeService: HomeService) {
        "ngInject";
    }

    $onInit() {
        this.homeService.getResults().then(r => this.results = r);
    }
}