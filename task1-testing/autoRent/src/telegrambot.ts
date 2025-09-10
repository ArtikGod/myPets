import { config } from "dotenv";
config()
import TelegramBot from 'node-telegram-bot-api';
import { getVehicleFree, getAllVehicles } from './vehicle/vehicleService'
import { createVehicle } from './vehicle/vehicleService'
import { Vehicle } from "./vehicle/vehicleModel";
import { showVehiclesAvaibleReservation, getReservationsVehicleAvailable, createReservationsTG } from "./reservations/reservationsService"
import { newVehicleData, deleteVehicle, getVehicleData } from './vehicle/vehicleService'

import { RESERVATIONS_STATUS, ALL_VEHICLES, MESSAGE } from "./constants";
const token = process.env.TG_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const adminIds = (process.env.ADMIN_TG_IDS || '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => Number(s));
const adminDbUserId = process.env.ADMIN_DB_USER_ID || '';
let bot: TelegramBot | undefined;
if (!token) {
  console.warn("TG_BOT_TOKEN is not set. Telegram bot will not start.");
} else {
  bot = new TelegramBot(token, { polling: true });
}

if (bot) {
// Diagnostics: show your Telegram id and admin check
bot.onText(/\/id/, async (data) => {
  const uid = data.from?.id ?? 0;
  const isAdmin = adminIds.includes(uid);
  await bot!.sendMessage(data.chat.id, `Your Telegram ID: ${uid}\nAdmin: ${isAdmin ? 'yes' : 'no'}`);
});

// Show admin menu explicitly if admin
bot.onText(/\/admin/, async (data) => {
  const isAdmin = adminIds.includes(data.from?.id ?? 0);
  if (!isAdmin) return bot!.sendMessage(data.chat.id, 'Forbidden: admin only');
  const keyboard = [
    [ { text: MESSAGE.SHOW_ALL_VEHICLES }, { text: MESSAGE.RESERVATION_VEHICLE } ],
    [ { text: '🛠 Admin: Add vehicle' }, { text: '🧾 Admin: List vehicles' } ],
    [ { text: '🔍 Admin: Vehicle info' }, { text: '✏️ Admin: Update vehicle' } ],
    [ { text: '🗑 Admin: Delete vehicle' } ]
  ];
  return bot!.sendMessage(data.chat.id, `${MESSAGE.MAIN_MENU}`, {
    reply_markup: { keyboard, resize_keyboard: true, one_time_keyboard: false }
  });
});

bot.onText(/\/start/, async (data) => {
  const isAdmin = adminIds.includes(data.from?.id ?? 0);
  const keyboard = isAdmin
    ? [
        [ { text: MESSAGE.SHOW_ALL_VEHICLES }, { text: MESSAGE.RESERVATION_VEHICLE } ],
        [ { text: '🛠 Admin: Add vehicle' }, { text: '🧾 Admin: List vehicles' } ],
        [ { text: '🔍 Admin: Vehicle info' }, { text: '✏️ Admin: Update vehicle' } ],
        [ { text: '🗑 Admin: Delete vehicle' } ]
      ]
    : [ [ { text: MESSAGE.SHOW_ALL_VEHICLES }, { text: MESSAGE.RESERVATION_VEHICLE } ] ];
  bot!.sendMessage(data.chat.id, `${MESSAGE.MAIN_MENU}`, {
    reply_markup: {
      keyboard,
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });  
});

bot.on('message', async (data) => {
if(data.text?.toString().startsWith(MESSAGE.SHOW_ALL_VEHICLES)) {
  const allVehicle = await getAllVehicles();  
  bot!.sendMessage(data.chat.id, `${ALL_VEHICLES}: \n${allVehicle}`)
  }
})

bot.on('message', async (data) => {
  if(data.text?.toString().startsWith(MESSAGE.RESERVATION_VEHICLE)) {
    const allVehicle = await getAllVehicles();
    const allVehicleKey = allVehicle.map((vehicle) => {
      return [{ text: vehicle, callback_data: vehicle }]
    })
    bot!.sendMessage(data.chat.id, MESSAGE.SELECT_VEHICLE, {
      reply_markup: {
        inline_keyboard: allVehicleKey,
      }
    })
    }
  })

  bot.on('callback_query', async (callbackQuery) => {
    const vehicle = callbackQuery.data; 
    const [make, model]:any = vehicle?.split('|'); 
    const vehicleDetails = await Vehicle.findOne({ make: make, model: model });
    const vehicleId = vehicleDetails?._id.toString();
    
    const price = vehicleDetails?.price
    const chatId = callbackQuery.from.id;
    if(!vehicleId) {
      return
    }
  
    bot!.sendMessage(chatId, MESSAGE.ENTER_DATE, {}); 
  
    bot!.once('message', async (data) => {
      if (!data.text) {
        return bot!.sendMessage(data.chat.id, MESSAGE.ENTER_DATE);
        }
        const userTgId = data.chat.id
      
      const messageParts = data.text.split(",").map((p) => p.trim());
      if (messageParts.length === 2) {
        const leaseStart = messageParts[0];
        const leaseEnd = messageParts[1];

    const reservation = await createReservationsTG(vehicleId, leaseStart, leaseEnd, price, userTgId)

    bot!.sendMessage( data.chat.id,  `${reservation}, ${vehicle}, ${leaseStart}, ${leaseEnd}, ${price}` )
      } else {
        bot!.sendMessage(chatId, MESSAGE.INVALID_DATE_FORMAT);
      }
    });
  });

  // Admin flow: Add vehicle via conversation
  const adminAddState = new Map<number, { step: number, make?: string, model?: string, year?: number, price?: number, photo?: string }>();
  // Admin flow: Update vehicle via conversation
  const adminUpdateState = new Map<number, { step: number, id?: string, make?: string, model?: string, year?: number, price?: number, photo?: string }>();
  // Admin flow: Delete vehicle via conversation
  const adminDeleteState = new Map<number, { step: number }>();
  // Admin flow: Info vehicle via conversation
  const adminInfoState = new Map<number, { step: number }>();

  bot.on('message', async (data) => {
    if (data.text === '🛠 Admin: Add vehicle') {
      if (!adminIds.includes(data.from?.id ?? 0)) {
        return bot!.sendMessage(data.chat.id, 'Forbidden: admin only');
      }
      if (!adminDbUserId) {
        return bot!.sendMessage(data.chat.id, 'Missing ADMIN_DB_USER_ID env for admin ops.');
      }
      adminAddState.set(data.chat.id, { step: 1 });
      return bot!.sendMessage(data.chat.id, 'Enter make:');
    }

    if (data.text === '🧾 Admin: List vehicles') {
      if (!adminIds.includes(data.from?.id ?? 0)) {
        return bot!.sendMessage(data.chat.id, 'Forbidden: admin only');
      }
      const list = await Vehicle.find();
      if (!list.length) return bot!.sendMessage(data.chat.id, 'No vehicles.');
      const message = list.map(v => `${v._id} — ${v.make} ${v.model} (${v.year}) • ${v.price}`).join('\n');
      return bot!.sendMessage(data.chat.id, message.substring(0, 3800));
    }

    if (data.text === '🔍 Admin: Vehicle info') {
      if (!adminIds.includes(data.from?.id ?? 0)) {
        return bot!.sendMessage(data.chat.id, 'Forbidden: admin only');
      }
      adminInfoState.set(data.chat.id, { step: 1 });
      return bot!.sendMessage(data.chat.id, 'Enter vehicle ID:');
    }

    if (data.text === '✏️ Admin: Update vehicle') {
      if (!adminIds.includes(data.from?.id ?? 0)) {
        return bot!.sendMessage(data.chat.id, 'Forbidden: admin only');
      }
      if (!adminDbUserId) {
        return bot!.sendMessage(data.chat.id, 'Missing ADMIN_DB_USER_ID env for admin ops.');
      }
      adminUpdateState.set(data.chat.id, { step: 1 });
      return bot!.sendMessage(data.chat.id, 'Enter vehicle ID to update:');
    }

    if (data.text === '🗑 Admin: Delete vehicle') {
      if (!adminIds.includes(data.from?.id ?? 0)) {
        return bot!.sendMessage(data.chat.id, 'Forbidden: admin only');
      }
      if (!adminDbUserId) {
        return bot!.sendMessage(data.chat.id, 'Missing ADMIN_DB_USER_ID env for admin ops.');
      }
      adminDeleteState.set(data.chat.id, { step: 1 });
      return bot!.sendMessage(data.chat.id, 'Enter vehicle ID to delete:');
    }

    // Handle Add flow
    const addState = adminAddState.get(data.chat.id);
    if (addState && !data.text?.startsWith('🛠')) {
      try {
        if (addState.step === 1) {
          addState.make = data.text ?? '';
          addState.step = 2;
          return bot!.sendMessage(data.chat.id, 'Enter model:');
        }
        if (addState.step === 2) {
          addState.model = data.text ?? '';
          addState.step = 3;
          return bot!.sendMessage(data.chat.id, 'Enter year (number):');
        }
        if (addState.step === 3) {
          const year = Number(data.text);
          if (!Number.isFinite(year)) return bot!.sendMessage(data.chat.id, 'Invalid year, try again:');
          addState.year = year;
          addState.step = 4;
          return bot!.sendMessage(data.chat.id, 'Enter price (number):');
        }
        if (addState.step === 4) {
          const price = Number(data.text);
          if (!Number.isFinite(price)) return bot!.sendMessage(data.chat.id, 'Invalid price, try again:');
          addState.price = price;
          addState.step = 5;
          return bot!.sendMessage(data.chat.id, 'Enter photo URL (optional). Send "-" to skip:');
        }
        if (addState.step === 5) {
          addState.photo = data.text === '-' ? '' : (data.text ?? '');
          const { make = '', model = '', year = 0, price = 0, photo = '' } = addState;
          await createVehicle(adminDbUserId, make, model, year, price, photo);
          adminAddState.delete(data.chat.id);
          return bot!.sendMessage(data.chat.id, `Vehicle added: ${make} ${model} (${year}) ${price}`);
        }
      } catch (err: any) {
        adminAddState.delete(data.chat.id);
        return bot!.sendMessage(data.chat.id, `Error: ${err?.message ?? 'unknown'}`);
      }
    }

    // Handle Info flow
    const infoState = adminInfoState.get(data.chat.id);
    if (infoState) {
      try {
        if (infoState.step === 1) {
          const id = (data.text ?? '').trim();
          if (!id) return bot!.sendMessage(data.chat.id, 'Provide a valid ID:');
          const details = await Vehicle.findById(id);
          adminInfoState.delete(data.chat.id);
          if (!details) return bot!.sendMessage(data.chat.id, 'Vehicle not found');
          return bot!.sendMessage(
            data.chat.id,
            `ID: ${details._id}\nMake: ${details.make}\nModel: ${details.model}\nYear: ${details.year}\nPrice: ${details.price}\nPhoto: ${details.photo || '-'}`
          );
        }
      } catch (err: any) {
        adminInfoState.delete(data.chat.id);
        return bot!.sendMessage(data.chat.id, `Error: ${err?.message ?? 'unknown'}`);
      }
    }

    // Handle Update flow
    const updState = adminUpdateState.get(data.chat.id);
    if (updState && !data.text?.startsWith('✏️')) {
      try {
        if (updState.step === 1) {
          const id = (data.text ?? '').trim();
          if (!id) return bot!.sendMessage(data.chat.id, 'Provide a valid ID:');
          updState.id = id;
          const existing = await Vehicle.findById(id);
          if (!existing) {
            adminUpdateState.delete(data.chat.id);
            return bot!.sendMessage(data.chat.id, 'Vehicle not found');
          }
          updState.make = typeof (existing as any).make === 'string' ? (existing as any).make : undefined;
          updState.model = typeof (existing as any).model === 'string' ? (existing as any).model : undefined;
          updState.year = typeof (existing as any).year === 'number' ? (existing as any).year : undefined;
          updState.price = typeof (existing as any).price === 'number' ? (existing as any).price : undefined;
          updState.photo = typeof (existing as any).photo === 'string' ? (existing as any).photo : undefined;
          updState.step = 2;
          return bot!.sendMessage(data.chat.id, `Enter make [current: ${existing.make}] (or '-' to keep):`);
        }
        if (updState.step === 2) {
          if (data.text !== '-') updState.make = data.text ?? updState.make;
          updState.step = 3;
          return bot!.sendMessage(data.chat.id, `Enter model [current: ${updState.model}] (or '-' to keep):`);
        }
        if (updState.step === 3) {
          if (data.text !== '-') updState.model = data.text ?? updState.model;
          updState.step = 4;
          return bot!.sendMessage(data.chat.id, `Enter year [current: ${updState.year}] (or '-' to keep):`);
        }
        if (updState.step === 4) {
          if (data.text !== '-') {
            const year = Number(data.text);
            if (!Number.isFinite(year)) return bot!.sendMessage(data.chat.id, 'Invalid year, try again or send "-" to keep:');
            updState.year = year;
          }
          updState.step = 5;
          return bot!.sendMessage(data.chat.id, `Enter price [current: ${updState.price}] (or '-' to keep):`);
        }
        if (updState.step === 5) {
          if (data.text !== '-') {
            const price = Number(data.text);
            if (!Number.isFinite(price)) return bot!.sendMessage(data.chat.id, 'Invalid price, try again or send "-" to keep:');
            updState.price = price;
          }
          updState.step = 6;
          return bot!.sendMessage(data.chat.id, `Enter photo URL [current: ${updState.photo || '-'}] (or '-' to keep):`);
        }
        if (updState.step === 6) {
          if (data.text !== '-') updState.photo = data.text ?? updState.photo;
          const { id = '', make = '', model = '', year = 0, price = 0, photo = '' } = updState;
          await newVehicleData(adminDbUserId, id, make, model, year, price, photo);
          adminUpdateState.delete(data.chat.id);
          return bot!.sendMessage(data.chat.id, `Vehicle updated: ${make} ${model} (${year}) ${price}`);
        }
      } catch (err: any) {
        adminUpdateState.delete(data.chat.id);
        return bot!.sendMessage(data.chat.id, `Error: ${err?.message ?? 'unknown'}`);
      }
    }

    // Handle Delete flow
    const delState = adminDeleteState.get(data.chat.id);
    if (delState && !data.text?.startsWith('🗑')) {
      try {
        if (delState.step === 1) {
          const id = (data.text ?? '').trim();
          if (!id) return bot!.sendMessage(data.chat.id, 'Provide a valid ID:');
          const existing = await Vehicle.findById(id);
          if (!existing) {
            adminDeleteState.delete(data.chat.id);
            return bot!.sendMessage(data.chat.id, 'Vehicle not found');
          }
          delState.step = 2;
          // simple confirmation
          (delState as any).id = id;
          return bot!.sendMessage(data.chat.id, `Confirm delete ${existing.make} ${existing.model}? Type YES to confirm:`);
        }
        if (delState.step === 2) {
          if ((data.text ?? '').toUpperCase() !== 'YES') {
            adminDeleteState.delete(data.chat.id);
            return bot!.sendMessage(data.chat.id, 'Deletion cancelled');
          }
          const id = (delState as any).id as string;
          await deleteVehicle(adminDbUserId, id);
          adminDeleteState.delete(data.chat.id);
          return bot!.sendMessage(data.chat.id, 'Vehicle deleted');
        }
      } catch (err: any) {
        adminDeleteState.delete(data.chat.id);
        return bot!.sendMessage(data.chat.id, `Error: ${err?.message ?? 'unknown'}`);
      }
    }
  });
}

export { bot }