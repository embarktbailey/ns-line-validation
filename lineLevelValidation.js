/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/record', 'N/log'], function(record, log) {

    var CRAccountType, DepartmentOverride, ClassOverride, LocationOverride, DepartmentMandatory, LocationMandatory, ClassMandatory, NameMandatory;
    var IncludeAccounts = [];
    var ExcludeAccounts = [];

    function fetchCustomRecordData() {
        try {
            // Load the custom record by its ID
            var customRecord = record.load({
                type: 'customrecord_line_segment_validation',
                id: '1' // Replace with actual record ID or pass dynamically
            });

            // Retrieve the value of the specific account field on the custom record
            CRAccountType = customRecord.getText({ fieldId: 'custrecord_account_type' });
            DepartmentOverride = customRecord.getValue({ fieldId: 'custrecord_department_override' });
            ClassOverride = customRecord.getValue({ fieldId: 'custrecord_class_override' });
            LocationOverride = customRecord.getValue({ fieldId: 'custrecord_location_override' });
            ExcludeAccounts = customRecord.getValue({ fieldId: 'custrecord_exclude_accounts' }) || [];
            IncludeAccounts = customRecord.getValue({ fieldId: 'custrecord_include_accounts' }) || [];

            // Ensure IncludeAccounts is an array
            if (!Array.isArray(IncludeAccounts)) {
                // If IncludeAccounts is not an array, convert it to one
                IncludeAccounts = [IncludeAccounts];
            }

            // Convert checkbox values to boolean
            DepartmentMandatory = customRecord.getValue({ fieldId: 'custrecord_department_mandatory' });
            LocationMandatory = customRecord.getValue({ fieldId: 'custrecord_location_mandatory' });
            ClassMandatory = customRecord.getValue({ fieldId: 'custrecord_class_mandatory' });
            NameMandatory = customRecord.getValue({ fieldId: 'custrecord_name_entity_mandatory' });

            // Log to check values of mandatory flags
            log.debug('Custom Record Data Loaded', {
                CRAccountType: CRAccountType,
                DepartmentOverride: DepartmentOverride,
                ClassOverride: ClassOverride,
                LocationOverride: LocationOverride,
                ExcludeAccounts: ExcludeAccounts,
                IncludeAccounts: IncludeAccounts,
                DepartmentMandatory: DepartmentMandatory,
                LocationMandatory: LocationMandatory,
                ClassMandatory: ClassMandatory,
                NameMandatory: NameMandatory
            });
        } catch (e) {
            log.error('Error loading custom record', e);
        }
    }

    function validateFields(context) {
        var currentRecord = context.currentRecord;
        var lineCount = currentRecord.getLineCount({ sublistId: 'line' });

        // Log to check values of mandatory flags
        log.debug('Validation Started', {
            DepartmentMandatory: DepartmentMandatory,
            LocationMandatory: LocationMandatory,
            ClassMandatory: ClassMandatory,
            NameMandatory: NameMandatory
        });

        // Loop through each line of the sublist
        for (var i = 0; i < lineCount; i++) {
            // Get the account value for the current line
            var accountType = currentRecord.getSublistValue({
                sublistId: 'line',
                fieldId: 'accounttype',
                line: i
            });

            var account = currentRecord.getSublistValue({
                sublistId: 'line',
                fieldId: 'account',
                line: i
            });

            // Get values of mandatory fields for the current line: Department, Class, and Location
            var department = currentRecord.getSublistValue({
                sublistId: 'line',
                fieldId: 'department',
                line: i
            });

            var entity = currentRecord.getSublistValue({
                sublistId: 'line',
                fieldId: 'entity',
                line: i
            });

            var classId = currentRecord.getSublistValue({
                sublistId: 'line',
                fieldId: 'class',
                line: i
            });

            var locationId = currentRecord.getSublistValue({
                sublistId: 'line',
                fieldId: 'location',
                line: i
            });

            // Log to check line values
            log.debug('Line Data', {
                line: i,
                accountType: accountType,
                account: account,
                department: department,
                entity: entity,
                classId: classId,
                locationId: locationId
            });

            // Check if the account type matches custom record or the account is included in Include Accounts
            if (accountType != CRAccountType && IncludeAccounts.indexOf(account) == -1) {

                log.debug('Is Account Included on line ' + (i)+ ':', IncludeAccounts.indexOf(account) == -1);

                continue;
            }

            if (accountType == CRAccountType && ExcludeAccounts.indexOf(account) != -1) {

                log.debug('Is Account Included on line ' + (i)+ ':', ExcludeAccounts.indexOf(account) == -1);

                continue;
            }

            // Check if department is mandatory and filled in on line
            if (DepartmentMandatory == true && department == "") {
                // Display an alert if department is empty
                alert('Please select a Department for line ' + (i + 1) + '.');
                return false; // Prevents the user from submitting the record
            }

            if (LocationMandatory == true && !locationId) {
                // Display an alert if Location is empty
                alert('Please select a Location for line ' + (i + 1) + '.');
                return false; // Prevents the user from submitting the record
            }

            if (ClassMandatory == true && !classId) {
                // Display an alert if Class is empty
                alert('Please select a Class for line ' + (i + 1) + '.');
                return false; // Prevents the user from submitting the record
            }

            if (NameMandatory == true && !entity) {
                // Display an alert if Entity is empty
                alert('Please select an Entity for line ' + (i + 1) + '.');
                return false; // Prevents the user from submitting the record
            }
        }

        // If all mandatory fields are filled for all lines, allow the user to submit the record
        return true;
    }

    return {
        saveRecord: validateFields,
        pageInit: fetchCustomRecordData
    };
});