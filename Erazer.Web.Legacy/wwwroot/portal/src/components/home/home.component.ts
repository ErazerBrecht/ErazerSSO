import { IResult } from '../../models/result.models'
import './home.style.scss';

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

    constructor() {
        "ngInject";
    }

    $onInit() {
        this.results = [
            {
                id: 'AAAA',
                subject: 'IOT',
                score: '20/20',
                remarks: 'Good job',
                credits: 3,
                added: new Date()
            },
            {
                id: 'BBBB',
                subject: 'C#',
                score: '20/20',
                remarks: 'Good job',
                credits: 6,
                added: new Date()
            }
        ]
    }


}