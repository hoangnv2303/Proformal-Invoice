/*
Proformal Model
*/
export class Request {
    IdRequest = "";
    IncomingDate = new Date();    
    OutgoingDate = new Date();
    // Requester
    Name = "";
    PhoneNumber = "";
    Company = "";
    Address = "";
    Email = "";
    // Host information
    HostName = "";
    Department = "";
    // List equipments
    Equipment : Equipment[];
    Remark = "";
}
export class Equipment{
    Name = '';
    PartCode = '';
    QuantityNumber = '';    
    QuantityWord = ''; 
    EquipmentRemark = "";
    file: [null];
}

export const Department = ['Assembly Operations',
'Asset Management & Service Support',
'Business Control',
'Engineering',
'Fulfillment & Inventory Control',
'General Affairs & Security',
'Human Resources',
'Information Technology ',
'Operational Excellence',
'Planning and Execution',
'Quality',
'Real Estate & Facilities ',
'Trade Compliance & Shipping',];