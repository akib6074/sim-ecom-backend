import { Injectable, Logger } from '@nestjs/common';

import { CountryService } from './country.service';
import { StateService } from './state.service';
import { ShopTypeService } from './shop-type.service';
import { TicketDepartmentService } from './ticket-department.service';

@Injectable()
export class CoreService {
  private readonly logger = new Logger(CoreService.name);
  constructor(
    private readonly countryService: CountryService,
    private readonly stateService: StateService,
    private readonly typeService: ShopTypeService,
    private readonly ticketDepartmentService: TicketDepartmentService,
  ) {}

  initCore = async (): Promise<boolean> => {
    this.logger.log('Core initializing is started');
    await this.countryService.initCountries();
    await this.stateService.initStates();
    await this.typeService.initTypes();
    await this.ticketDepartmentService.initTicketDepartment();
    return true;
  };
}
