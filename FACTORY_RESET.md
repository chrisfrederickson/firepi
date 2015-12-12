# How to manually factory reset

* First we need return to full defaults

    * `write 1602 => 800`



## Restore Input
* `read 1601`
    * `write 1601 => 0` for Input 1
## Input Diagnostics
* `read 8`
    * We got 7. Not sure what that means (univ?)

## Setup Parameters

### System

#### Manufacturer Date

* `read 5`

* MMYY



#### Serial Number

* `read 2`



#### Fahrenheit or Celcius

* F: `x = 0`

* C: `x = 1`

    * `write 901 => x`



### Analog Input


#### Sensor Type
* `read 601`
    * Should be `2 (thermocouple)`

#### Decimal Point
* `read 606`
    * Should be `1 (0.0)`

#### SP Low Limit
* `read 605`
    * Should be `0`

### Digital Input
`read 201`
    * Should be `0 (low)`

## Operational Parameters
