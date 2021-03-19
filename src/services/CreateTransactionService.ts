import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    // if (!['income', 'outcome'].includes(type)) {
    //   throw new AppError('Transaction type is invalid');
    // }

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('you do not have enough balance');
    }

    let categoryFinded = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryFinded) {
      categoryFinded = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryFinded);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryFinded,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
