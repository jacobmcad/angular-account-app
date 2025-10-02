import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock: GET /api/user
  http.get('*/api/user', () => {
    console.warn('[MSW] Intercepted /api/user');
    return HttpResponse.json({
      fullName: 'Jacob McAdams',
      priName: 'Jacob McAdams',
      aliases: ['jmcadams (Ldap)'],
      personTypes: ['POI', 'POI-esp'],
      employeeId: '8027541',
      orcid: 'https://orcid.org/0009-0005-0548-6358',
      altEmail: 'jacobcmcad@gmail.com',
      email: 'jmcadams@umn.edu',
      passwordCreateDate: '2025-09-05T14:17:17.000Z',
      passwordExpireDate: '2026-09-05T19:17:00.000Z',
      duoStatus: {
        required: true,
        willActivate: '2025-09-12T16:00:00.000Z',
      },
      provisionedAccounts: [
        { system: 'AD Account', status: 'Active' },
        { system: 'Google Account', status: 'Active' },
        { system: 'Ldap Account', status: 'Active' },
        { system: 'PeopleSoft Writeback', status: 'Active' },
      ],
      vpnAccess: 'Y',
      wirelessAccess: 'Y',
      accountSuppression: 'N',
      staffDetails: {
        poiTitle: 'UI/UX Designer',
        // placeholders for future backend fields:
        jobType: '00015',
        jobStatus: 'A',
        jobDepartmentId: '10067 - Identity Access Management',
        jobCode: '-',
        location: 'TCWESTBANK',
      },
      campAddress: {
        org: 'Ofc of Information Technology',
        room: 'Room 660 WBOB',
        code: '7531A',
        street: '1300 S 2nd St',
        city: 'Minneapolis',
        state: 'MN',
        zip: '55454',
        country: 'USA',
      },
    });
  }),
 // mock reset password endpoint only
  http.post('/api/password/reset', async ({ request }) => {
    // parse JSON body from the Fetch-style Request object
    console.warn('[MSW] Intercepted /api/password/reset');
    const body = await request.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    // field validation
    if (!currentPassword || !newPassword) {
      return HttpResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 12) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Password must be at least 12 characters long.',
        },
        { status: 400 }
      );
    }

    // pretend the reset succeeded
    return HttpResponse.json(
      { success: true, message: 'Password changed successfully.' },
      { status: 200 }
    );
  }),
  http.post('*/api/guest-account', async ({ request }) => {
    console.warn('[MSW] Intercepted /api/guest-account');
    const body = await request.json() as { email?: string; }; // minimal check

    if (!body.email) {
      return HttpResponse.json(
        { success: false, message: 'Email address is required.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Guest account created. A confirmation email has been sent.',
      referenceId: 'GA-12345',
    });
  }),
  http.post('*/api/claim-account', async ({ request }) => {
    console.warn('[MSW] Intercepted /api/claim-account');
    const body = await request.json() as { idNumber?: string; password?: string; };

    if (!body.idNumber) {
      return HttpResponse.json(
        { success: false, message: 'ID number is required.' },
        { status: 400 }
      );
    }

    if (!body.password || body.password.length < 16) {
      return HttpResponse.json(
        { success: false, message: 'Password must meet minimum requirements.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Account claimed. You may now sign in with your new password.',
    });
  }),
  http.post('*/api/recover-password', async ({ request }) => {
    console.warn('[MSW] Intercepted /api/recover-password');
    const body = await request.json() as { identifier?: string };

    if (!body.identifier) {
      return HttpResponse.json(
        { success: false, message: 'Enter your Internet ID or alternate email address.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Check your email for password recovery instructions.',
    });
  }),
  http.post('*/api/recover-internet-id', async ({ request }) => {
    console.warn('[MSW] Intercepted /api/recover-internet-id');
    const body = await request.json() as { alternateEmail?: string };

    if (!body.alternateEmail) {
      return HttpResponse.json(
        { success: false, message: 'Enter your alternate email address.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Your Internet ID has been sent to your alternate email address.',
    });
  }),
];
