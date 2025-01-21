/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get("health")
  getHello(): string {
    console.log("Check Health");
    return "Hello";
  }
}
