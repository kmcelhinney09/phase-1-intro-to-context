/*
createEmployeeRecord
Input: An array with First name, Family name, title, and payrate per hour
Output: JS Object with keys matching input plus timeInEvents and TimeOutEvents that intialize as empty arrays
*/
function createEmployeeRecord(employeeDataArray) {
    const employeeRecord = {}
    employeeRecord["firstName"] = employeeDataArray[0]
    employeeRecord["familyName"] = employeeDataArray[1]
    employeeRecord["title"] = employeeDataArray[2]
    employeeRecord["payPerHour"] = employeeDataArray[3]
    employeeRecord["timeInEvents"] = []
    employeeRecord["timeOutEvents"] = []
    
    return employeeRecord
}
/*
createEmployeeRecords
Input: An array of arrays of employee data [first name, family name, title, pay rate]
Output: Array of JS objects from createEmployeeRecord
*/
function createEmployeeRecords(arrayOfEmployees) {
    const employeesArray = arrayOfEmployees.map(employeeData => {
        return createEmployeeRecord(employeeData)
    })
    return employeesArray
}
/*
createTimeInEvent
Input: Employee Record and date and time stamp of clock in
Output: The employee record with the updated timeInEvent that is an object of {type: TimeIn, hour: , date:}
*/
function createTimeInEvent(employeeRecord, clockInEvent) {

    if (checkClockInput(clockInEvent)) {
        const timeInEvent = createDateAndTimeEvent(clockInEvent)
        timeInEvent["type"] = "TimeIn"

        employeeRecord.timeInEvents.push(timeInEvent)
        return employeeRecord
    }
}
/*
createTimeOutEvent
Input: Employee Record and date and time stamp of clock out
Output: The employeee record with the updated timeOutEvent that is an object of {type: TimeIn, hour: , date:}
*/
function createTimeOutEvent(employeeRecord, clockOutEvent) {

    if (checkClockInput(clockOutEvent)) {
        const timeOutEvent = createDateAndTimeEvent(clockOutEvent)
        timeOutEvent["type"] = "TimeOut"
        employeeRecord.timeOutEvents.push(timeOutEvent)
        return employeeRecord
    }
}
/*
hoursWorkedOnDate
Input: Employee record, the date for which you want to find the number of hours worked
Output: an integer of the number of hours worked on the target date
*/
function hoursWorkedOnDate(employeeRecord, targetDate) {
    let hasTimeIn = false
    let hasTimeOut = false

    const timeIn = employeeRecord.timeInEvents.filter(clockEvent => {
        if (clockEvent.date === targetDate) {
            hasTimeIn = true
            return clockEvent
        }
    })
    const timeOut = employeeRecord.timeOutEvents.filter(clockEvent => {
        if (clockEvent.date === targetDate) {
            hasTimeOut = true
            return clockEvent
        }
    })
    let clockInMillSec = createDateTimeObject(timeIn[0].date, timeIn[0].hour)
    let clockOutMillSec = createDateTimeObject(timeOut[0].date, timeOut[0].hour)

    if (!hasTimeIn && !hasTimeOut) {
        throw new Error(`The date ${targetDate} has no clock events`)
    } else if (!hasTimeOut && hasTimeIn) {
        throw new Error(`The date ${targetDate} does not have a clock out`)
    } else if (hasTimeOut && !hasTimeIn) {
        throw new Error(`The date ${targetDate} does not have a clock in`)
    }
    else {
        const targetYear = targetDate.split("-")[0]
        if (parseInt(targetYear) < 1970) {
            return (timeOut[0].hour - timeIn[0].hour) / 100
        } else {
            return (clockOutMillSec - clockInMillSec) / 3600000
        }

    }
}
/*
wagesEarnedOnDate
Input: Employee record, date for which you want to find the about of wages earned
Output: an integer of the amount of money owed for the number of hrs worked on target date
*/
function wagesEarnedOnDate(employeeRecord, targetDate) {
    return hoursWorkedOnDate(employeeRecord, targetDate) * employeeRecord.payPerHour
}
/* 
allWagesFor
Input: Employee record
Output: An integer of the amount of money owed for total hrs worked 
*/
function allWagesFor(employeeRecord) {
    const clockIns = employeeRecord.timeInEvents
    const hoursWorked = clockIns.map(clockEvent => {
        const date = clockEvent.date
        const hours = hoursWorkedOnDate(employeeRecord, date)
        return hours
    })
    return (hoursWorked.reduce((total, hours) => total + hours)) * employeeRecord.payPerHour

}
/*
calculatePayroll
Input: Arroy of employee records
Output: an integer that is the sum of all payroll for total hrs worked
*/
function calculatePayroll(allEmployees) {
    const wagesForAllEmployees = allEmployees.map(employee => {
        return allWagesFor(employee)
    })
    return wagesForAllEmployees.reduce((payroll, wages) => payroll + wages)
}


// Helper functions
function createDateAndTimeEvent(dateTimeEvent) {
    const eventDateTime = {}
    const arrayOfDateAndTime = dateTimeEvent.split(" ")
    eventDateTime["type"] = ""
    eventDateTime["hour"] = parseInt(arrayOfDateAndTime[1])
    eventDateTime["date"] = arrayOfDateAndTime[0]

    return eventDateTime
}

function recordsComplete(employeeRecord) {
    const timeOutDates = {}
    const timeInDates = employeeRecord.timeInEvents.map(clockEvent => clockEvent.date)
    employeeRecord.timeOutEvents.forEach(clockEvent => {
        timeOutDates[clockEvent.date] = true
    })

    for (const date of timeInDates) {
        if (date in timeOutDates) {
            continue
        } else {
            throw new Error(`Clock in for ${date} has no matching clock out`)
        }
    }
}
function createDateTimeObject(date, hour) {
    let splitHour
    let splitMin
    if(hour < 1000){
        hour = "0" + hour.toString()
        splitHour = hour.split("").splice(0, 2).join("")
        splitMin = hour.split("").splice(2).join("")
    }else{
        splitHour = hour.toString().split("").splice(0, 2).join("")
        splitMin = hour.toString().split("").splice(2).join("")
    }

    const splitClockInDate = date.split("-")
    const month = parseInt(splitClockInDate[1]) - 1
    const clockInDateTime = new Date(splitClockInDate[0], month.toString(), splitClockInDate[2], splitHour, splitMin)

    return clockInDateTime.valueOf()
}

function checkClockInput(clockEvent) {
    const reg = /^\d{4}-\d{2}-\d{2} \d{4}$/
    if (reg.test(clockEvent)) {
        return true
    } else {
        throw new Error(`Input of ${clockEvent} is not a valid clock event please input as 'yyyy-mm-dd 24-time'`)
    }
}



//Funciton tests
function testCreateEmployeeRecord() {
    const employee = createEmployeeRecord(['Kevin', 'McElhinney', 'CTO', 56])
    console.log('Employee Record Created:')
    console.log(employee)
}

function testCreateEmployeeRecords() {
    const employees = createEmployeeRecords([['Kevin', 'McElhinney', 'CTO', 56], ['Sally', 'McElhinney', 'CEO', 100]])
    console.log('Employee Records Created:')
    console.log(employees)
}

function testCreateTimeInEvent() {
    const employee = createEmployeeRecord(['Kevin', 'McElhinney', 'CTO', 56])
    const newClockIn = '2021-11-22 1200'
    const newClockInEvent = createTimeInEvent(employee, newClockIn)
    console.log(`The Type of event is: ${newClockInEvent.timeInEvents[0].type}`)
    console.log(`The hour of event is: ${newClockInEvent.timeInEvents[0].hour}`)
    console.log(`The date of the event is: ${newClockInEvent.timeInEvents[0].date}`)
}

function testCreateTimeOutEvent() {
    const employee = createEmployeeRecord(['Kevin', 'McElhinney', 'CTO', 56])
    const newClockOut = '2021-11-22 1200'
    const newClockOutEvent = createTimeOutEvent(employee, newClockOut)
    console.log(`The Type of event is: ${newClockOutEvent.timeOutEvents[0].type}`)
    console.log(`The hour of event is: ${newClockOutEvent.timeOutEvents[0].hour}`)
    console.log(`The date of the event is: ${newClockOutEvent.timeOutEvents[0].date}`)
}
function testHoursWorkedOnDate() {
    let employee = createEmployeeRecord(['Kevin', 'McElhinney', 'CTO', 56])
    employee = createTimeInEvent(employee, '2021-11-22 1800')
    employee = createTimeOutEvent(employee, '2021-11-22 1900')
    const targetDate = '2021-11-22'
    const hoursWorked = hoursWorkedOnDate(employee, targetDate)
    console.log(`${employee.firstName} has ${hoursWorked} hours of work on ${targetDate}`)
}

function testWagesEarnedOnDate() {
    let employee = createEmployeeRecord(['Kevin', 'McElhinney', 'CTO', 56])
    employee = createTimeInEvent(employee, '2021-11-22 1200')
    employee = createTimeOutEvent(employee, '2021-11-22 2015')
    const targetDate = '2021-11-22'
    const wages = wagesEarnedOnDate(employee, targetDate)
    const hoursWorked = hoursWorkedOnDate(employee, targetDate)
    console.log(`${employee.firstName} earned $${wages} for ${hoursWorked} hours of work on ${targetDate} at $${employee.payPerHour} per hour`)
}

function testAllWagesFor() {
    let employee = createEmployeeRecord(['Kevin', 'McElhinney', 'CTO', 20])
    employee = createTimeInEvent(employee, '2021-11-22 1200')
    employee = createTimeOutEvent(employee, '2021-11-22 2400')

    employee = createTimeInEvent(employee, '2021-11-24 1200')
    employee = createTimeOutEvent(employee, '2021-11-24 2400')

    const totalWages = allWagesFor(employee)
    console.log(`The total wages for ${employee.firstName} ${employee.familyName} is ${totalWages}`)
}

function testCalculatePayroll() {
    let employee = createEmployeeRecord(['Kevin', 'McElhinney', 'CTO', 50])
    employee = createTimeInEvent(employee, '2021-11-22 1200')
    employee = createTimeOutEvent(employee, '2021-11-22 2200')

    employee = createTimeInEvent(employee, '2021-11-24 1200')
    employee = createTimeOutEvent(employee, '2021-11-24 2200')

    let employeeTwo = createEmployeeRecord(['Sally', 'McElhinney', 'CEO', 100])
    employeeTwo = createTimeInEvent(employeeTwo, '2021-11-22 1200')
    employeeTwo = createTimeOutEvent(employeeTwo, '2021-11-22 2200')

    employeeTwo = createTimeInEvent(employeeTwo, '2021-11-24 1200')
    employeeTwo = createTimeOutEvent(employeeTwo, '2021-11-24 2200')

    const allEmployees = [employee, employeeTwo]

    const payRoll = calculatePayroll(allEmployees)
    // employee (20hrs * $50) + (20hrs *$100) = $3000
    console.log(`The total payroll is $${payRoll}`)
}

function testRecordsComplete() {
    let employee = createEmployeeRecord(['Kevin', 'McElhinney', 'CTO', 50])
    employee = createTimeInEvent(employee, '2021-11-22 1200')
    employee = createTimeOutEvent(employee, '2021-11-22 2200')

    employee = createTimeInEvent(employee, '2021-11-24 1200')


    let employeeTwo = createEmployeeRecord(['Sally', 'McElhinney', 'CEO', 100])
    employeeTwo = createTimeInEvent(employeeTwo, '2021-11-22 1200')
    employeeTwo = createTimeOutEvent(employeeTwo, '2021-11-22 2200')

    employeeTwo = createTimeInEvent(employeeTwo, '2021-11-24 1200')
    employeeTwo = createTimeOutEvent(employeeTwo, '2021-11-24 2200')

    const allEmployees = [employee, employeeTwo]
    recordsComplete(employee)
}
function runAllTests() {
    // testCreateEmployeeRecord()
    // testCreateEmployeeRecords()
    // testCreateTimeInEvent()
    // testCreateTimeOutEvent()
    // testHoursWorkedOnDate()
    // testWagesEarnedOnDate()
    // testAllWagesFor()
    // testCalculatePayroll()
    // testRecordsComplete()


}

runAllTests()
